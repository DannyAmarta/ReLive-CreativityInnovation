import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { FeatureAnalysisDto } from './dto/feature-analysis.dto';
import { GeneratePlanDto, RecommendationPhaseGoal } from './dto/generate-plan.dto';
import {
  FeatureThreatAnalysis,
  GeneratedRoutineEntry,
  GeneratedWorkoutPlan,
  RecommendationSafetyWindow,
} from './recommendation.types';
import { SetService } from '../set/set.service';
import { SetExerciseCategory, SetExerciseDefinition } from '../set/set.types';

const QWEN_MODEL = 'openai/gpt-oss-120b:free';
const QWEN_BASE_URL = 'https://openrouter.ai/api/v1';
const QWEN_TIMEOUT_MS = 40_000;

const WORKOUT_RECOMMENDATION_SYSTEM_PROMPT = `
You are a deterministic physiological workout planner operating under a hard safety envelope calculated by the server.
Return raw JSON only.
Do not output markdown, code fences, prose outside JSON, or explanatory preambles.
You are forbidden from inventing or recalculating safety-critical math.
Treat the server-provided weight, set, and rep limits as non-negotiable hard boundaries.
If weight bounds are null, prescribedWeightKg must stay null.
If you are unsure, stay conservative and keep the plan inside the given boundaries.
Output must match exactly this JSON shape:
{"phaseGoal":"string","rationale":"string","routine":[{"exercise":"string","sets":number,"reps":number,"prescribedWeightKg":number|null,"rationale":"string"}]}
`.trim();

const UNIVERSAL_ARCHITECT_SYSTEM_PROMPT = `
You are an elite, Staff-Level Software Architect specializing in NestJS, TypeScript, Next.js, Prisma, GraphQL, background jobs, and scalable backend systems.
Your job is to analyze feature requests or system architectures and break them down into actionable blueprints.
Your superpower is anticipating hidden architectural, security, and data-integrity failures before they happen.
Critical rules:
1. Do not give generic advice. Be hyper-specific to NestJS, TypeScript, Prisma, validation, API design, async processing, and operational safety.
2. Every threat identified must have a concrete code-level or architectural fix.
3. Do not output markdown code blocks, conversational filler, or pleasantries.
4. Return raw valid JSON only.
Output must match exactly this schema:
{"featureName":"string","executiveSummary":"string","implementationSteps":[{"step":"string","action":"string","technicalDetail":"string"}],"dangerousProblems":[{"threatName":"string","theThreat":"string","theFix":"string"}]}
`.trim();

type RawModelPlan = {
  phaseGoal?: string;
  rationale?: string;
  routine?: Array<{
    exercise?: string;
    sets?: number;
    reps?: number;
    prescribedWeightKg?: number | null;
    rationale?: string;
  }>;
};

type RawFeatureThreatAnalysis = {
  featureName?: string;
  executiveSummary?: string;
  implementationSteps?: Array<{
    step?: string | number;
    action?: string;
    technicalDetail?: string;
  }>;
  dangerousProblems?: Array<{
    threatName?: string;
    theThreat?: string;
    theFix?: string;
  }>;
};

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);
  private readonly client: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly setService: SetService,
  ) {
    // this.client = new OpenAI({
    //   apiKey: this.configService.get<string>('QWEN_API_KEY') ?? '',
    //   baseURL: QWEN_BASE_URL,
    //   timeout: QWEN_TIMEOUT_MS,
    //   maxRetries: 1,
    // });
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('QWEN_API_KEY') ?? '',
      baseURL: QWEN_BASE_URL,
      timeout: 40000,
      maxRetries: 2,
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'relive-ai'
      }
    });

  }

  async generateWorkoutPlan(
    userId: number,
    dto: GeneratePlanDto,
  ): Promise<GeneratedWorkoutPlan> {
    this.ensureAiConfigured();

    const exercise = this.setService
      .getExercises()
      .find((item) => item.id === dto.exerciseId);

    if (!exercise) {
      throw new NotFoundException(`Unknown exercise "${dto.exerciseId}".`);
    }

    const analytics = await this.setService.getPerformanceAnalytics(
      userId,
      dto.exerciseId,
      dto.days ?? 14,
    );
    const safetyWindow = this.computeSafetyWindow(exercise, analytics, dto);
    const userPrompt = this.buildRecommendationPrompt(
      exercise,
      analytics.contextSummary,
      dto,
      safetyWindow,
    );
    const parsed = await this.requestStructuredJson<RawModelPlan>({
      systemPrompt: WORKOUT_RECOMMENDATION_SYSTEM_PROMPT,
      userPrompt,
      logContext: `workout plan generation for user ${userId} and exercise ${dto.exerciseId}`,
      failureMessage: 'Unable to generate a workout plan right now.',
    });

    return this.sanitizePlan(
      parsed,
      exercise,
      dto.phaseGoal,
      analytics.contextSummary,
      safetyWindow,
    );
  }

  async analyzeFeatureThreats(
    userId: number,
    dto: FeatureAnalysisDto,
  ): Promise<FeatureThreatAnalysis> {
    this.ensureAiConfigured();

    const parsed = await this.requestStructuredJson<RawFeatureThreatAnalysis>({
      systemPrompt: UNIVERSAL_ARCHITECT_SYSTEM_PROMPT,
      userPrompt: this.buildFeatureAnalysisPrompt(dto),
      logContext: `feature analysis for user ${userId}`,
      failureMessage: 'Unable to analyze the feature right now.',
    });

    return this.sanitizeFeatureThreatAnalysis(parsed, dto);
  }

  private buildRecommendationPrompt(
    exercise: SetExerciseDefinition,
    contextSummary: string,
    dto: GeneratePlanDto,
    safetyWindow: RecommendationSafetyWindow,
  ) {
    const safetyEnvelope = JSON.stringify(
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        phaseGoal: dto.phaseGoal,
        minSets: safetyWindow.minSets,
        maxSets: safetyWindow.maxSets,
        minReps: safetyWindow.minReps,
        maxReps: safetyWindow.maxReps,
        minWeightKg: safetyWindow.minWeightKg,
        maxWeightKg: safetyWindow.maxWeightKg,
      },
      null,
      2,
    );

    return [
      'Build one safe workout prescription for the requested lift.',
      `Exercise: ${exercise.name}.`,
      `Exercise category: ${exercise.category}.`,
      `Phase goal: ${dto.phaseGoal}.`,
      `Physiological context: ${contextSummary}`,
      `Training days per week: ${dto.trainingDaysPerWeek ?? 3}.`,
      typeof dto.targetSets === 'number'
        ? `Preferred sets: ${dto.targetSets}.`
        : '',
      typeof dto.targetReps === 'number'
        ? `Preferred reps: ${dto.targetReps}.`
        : '',
      dto.notes ? `Coach notes: ${dto.notes}` : '',
      'The server already performed the math and calculated the only approved safety envelope below.',
      'Do not calculate percentages, progression jumps, or alternative ranges yourself.',
      `Approved safety envelope:\n${safetyEnvelope}`,
      `Sets must stay between ${safetyWindow.minSets} and ${safetyWindow.maxSets}.`,
      `Reps must stay between ${safetyWindow.minReps} and ${safetyWindow.maxReps}.`,
      safetyWindow.minWeightKg !== null && safetyWindow.maxWeightKg !== null
        ? `Prescribed weight must stay between ${safetyWindow.minWeightKg}kg and ${safetyWindow.maxWeightKg}kg inclusive.`
        : 'Prescribed weight must remain null and the routine must emphasize conservative baseline testing.',
      'Never exceed the approved envelope even if the context sounds advanced.',
      'If any instruction conflicts with the envelope, obey the envelope.',
      'Return one focused routine entry for the requested exercise.',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private buildFeatureAnalysisPrompt(dto: FeatureAnalysisDto) {
    return [
      `Feature request: ${dto.featureRequest}`,
      dto.featureName ? `Preferred feature name: ${dto.featureName}.` : '',
      dto.systemContext ? `Current system context: ${dto.systemContext}` : '',
      dto.focusAreas?.length
        ? `Priority focus areas: ${dto.focusAreas.join(', ')}.`
        : '',
      'Assume the project uses NestJS, TypeScript, Prisma, GraphQL, Next.js App Router, validation layers, and asynchronous/background processing when relevant.',
      'You must identify implementation steps and dangerous problems with concrete fixes.',
      'Return only the required JSON shape.',
    ]
      .filter(Boolean)
      .join(' ');
  }

  private sanitizePlan(
    plan: RawModelPlan,
    exercise: SetExerciseDefinition,
    phaseGoal: RecommendationPhaseGoal,
    contextSummary: string,
    safetyWindow: RecommendationSafetyWindow,
  ): GeneratedWorkoutPlan {
    const rawRoutine = Array.isArray(plan.routine) && plan.routine.length > 0
      ? plan.routine
      : [
          {
            exercise: exercise.name,
            sets: safetyWindow.minSets,
            reps: safetyWindow.minReps,
            prescribedWeightKg: safetyWindow.minWeightKg,
            rationale: 'Server fallback routine.',
          },
        ];

    const routine: GeneratedRoutineEntry[] = rawRoutine.slice(0, 1).map((entry) => {
      const sets = this.clamp(
        this.coerceInt(entry.sets, safetyWindow.minSets),
        safetyWindow.minSets,
        safetyWindow.maxSets,
      );
      const reps = this.clamp(
        this.coerceInt(entry.reps, safetyWindow.minReps),
        safetyWindow.minReps,
        safetyWindow.maxReps,
      );

      let prescribedWeightKg: number | null = null;

      if (
        safetyWindow.minWeightKg !== null &&
        safetyWindow.maxWeightKg !== null
      ) {
        const rawWeight = this.coerceNumber(
          entry.prescribedWeightKg,
          safetyWindow.minWeightKg,
        );
        prescribedWeightKg = this.roundToTenth(
          this.clamp(rawWeight, safetyWindow.minWeightKg, safetyWindow.maxWeightKg),
        );
      }

      return {
        exercise: exercise.name,
        sets,
        reps,
        prescribedWeightKg,
        rationale:
          typeof entry.rationale === 'string' && entry.rationale.trim().length > 0
            ? entry.rationale.trim()
            : 'Server-sanitized routine inside the approved safety window.',
      };
    });

    return {
      phaseGoal,
      rationale:
        typeof plan.rationale === 'string' && plan.rationale.trim().length > 0
          ? this.cleanText(plan.rationale, contextSummary, 400)
          : contextSummary,
      contextSummary,
      safetyWindow,
      routine,
    };
  }

  private sanitizeFeatureThreatAnalysis(
    analysis: RawFeatureThreatAnalysis,
    dto: FeatureAnalysisDto,
  ): FeatureThreatAnalysis {
    const fallbackFeatureName =
      dto.featureName ??
      this.cleanText(dto.featureRequest, 'Feature analysis', 80);

    const implementationSteps = (
      Array.isArray(analysis.implementationSteps) && analysis.implementationSteps.length > 0
        ? analysis.implementationSteps
        : [
            {
              step: '1',
              action: 'Define the module boundary.',
              technicalDetail:
                'Create a dedicated NestJS module, controller, service, DTOs, and persistence boundaries before adding transport-specific logic.',
            },
          ]
    )
      .slice(0, 8)
      .map((step, index) => ({
        step: this.cleanText(
          typeof step.step === 'number' ? String(step.step) : step.step,
          String(index + 1),
          24,
        ),
        action: this.cleanText(
          step.action,
          'Define the core implementation step.',
          220,
        ),
        technicalDetail: this.cleanText(
          step.technicalDetail,
          'Specify the NestJS, TypeScript, data, validation, or async pattern that should be used.',
          500,
        ),
      }));

    const dangerousProblems = (
      Array.isArray(analysis.dangerousProblems) && analysis.dangerousProblems.length > 0
        ? analysis.dangerousProblems
        : [
            {
              threatName: 'Specification Drift',
              theThreat:
                'If requirements are not pinned to DTOs, validation, and persistence rules, different endpoints can silently diverge and corrupt behavior.',
              theFix:
                'Lock the contract with DTO validation, a dedicated module boundary, and one canonical service layer before exposing the feature broadly.',
            },
          ]
    )
      .slice(0, 8)
      .map((problem) => ({
        threatName: this.cleanText(
          problem.threatName,
          'Unspecified Threat',
          120,
        ),
        theThreat: this.cleanText(
          problem.theThreat,
          'The threat was not fully described by the model.',
          700,
        ),
        theFix: this.cleanText(
          problem.theFix,
          'Define a concrete architectural fix before implementation starts.',
          700,
        ),
      }));

    return {
      featureName: this.cleanText(analysis.featureName, fallbackFeatureName, 120),
      executiveSummary: this.cleanText(
        analysis.executiveSummary,
        'Build the feature behind strict NestJS boundaries, preserve data integrity, and neutralize high-risk failure modes before scaling it.',
        500,
      ),
      implementationSteps,
      dangerousProblems,
    };
  }

  private computeSafetyWindow(
    exercise: SetExerciseDefinition,
    analytics: Awaited<ReturnType<SetService['getPerformanceAnalytics']>>,
    dto: GeneratePlanDto,
  ): RecommendationSafetyWindow {
    const anchoredOneRepMax =
      analytics.emaOneRepMaxKg ??
      analytics.baselineAverageOneRepMaxKg ??
      analytics.latestCleanOneRepMaxKg ??
      analytics.latestLoggedOneRepMaxKg;

    if (
      exercise.category === SetExerciseCategory.METABOLIC_CARDIO ||
      anchoredOneRepMax === null
    ) {
      return this.getColdStartWindow(dto.phaseGoal);
    }

    const fatigueAdjustment = analytics.latestSessionFlagged ? 0.05 : 0;

    switch (dto.phaseGoal) {
      case RecommendationPhaseGoal.STRENGTH:
        return this.applyTargetPreferences(
          this.createWeightedWindow(
            anchoredOneRepMax,
            0.78 - fatigueAdjustment,
            0.87 - fatigueAdjustment,
            3,
            analytics.latestSessionFlagged ? 4 : 5,
            3,
            5,
          ),
          dto,
        );
      case RecommendationPhaseGoal.POWER:
        return this.applyTargetPreferences(
          this.createWeightedWindow(
            anchoredOneRepMax,
            0.55 - fatigueAdjustment,
            0.7 - fatigueAdjustment,
            3,
            5,
            2,
            4,
          ),
          dto,
        );
      case RecommendationPhaseGoal.RECOVERY:
        return this.applyTargetPreferences(
          this.createWeightedWindow(
            anchoredOneRepMax,
            0.5,
            0.6,
            2,
            3,
            5,
            8,
          ),
          dto,
        );
      case RecommendationPhaseGoal.BASELINE_TESTING:
        return this.applyTargetPreferences(
          this.createWeightedWindow(
            anchoredOneRepMax,
            0.55,
            0.65,
            3,
            4,
            4,
            6,
          ),
          dto,
        );
      case RecommendationPhaseGoal.HYPERTROPHY:
      default:
        return this.applyTargetPreferences(
          this.createWeightedWindow(
            anchoredOneRepMax,
            0.65 - fatigueAdjustment,
            0.75 - fatigueAdjustment,
            3,
            analytics.latestSessionFlagged ? 4 : 5,
            8,
            12,
          ),
          dto,
        );
    }
  }

  private getColdStartWindow(
    phaseGoal: RecommendationPhaseGoal,
  ): RecommendationSafetyWindow {
    switch (phaseGoal) {
      case RecommendationPhaseGoal.STRENGTH:
        return {
          minWeightKg: null,
          maxWeightKg: null,
          minSets: 3,
          maxSets: 4,
          minReps: 3,
          maxReps: 5,
        };
      case RecommendationPhaseGoal.POWER:
        return {
          minWeightKg: null,
          maxWeightKg: null,
          minSets: 3,
          maxSets: 4,
          minReps: 2,
          maxReps: 4,
        };
      case RecommendationPhaseGoal.RECOVERY:
        return {
          minWeightKg: null,
          maxWeightKg: null,
          minSets: 2,
          maxSets: 3,
          minReps: 5,
          maxReps: 8,
        };
      case RecommendationPhaseGoal.BASELINE_TESTING:
      case RecommendationPhaseGoal.HYPERTROPHY:
      default:
        return {
          minWeightKg: null,
          maxWeightKg: null,
          minSets: 3,
          maxSets: 4,
          minReps: 5,
          maxReps: 8,
        };
    }
  }

  private createWeightedWindow(
    anchoredOneRepMax: number,
    minPercent: number,
    maxPercent: number,
    minSets: number,
    maxSets: number,
    minReps: number,
    maxReps: number,
  ): RecommendationSafetyWindow {
    return {
      minWeightKg: this.roundToTenth(anchoredOneRepMax * minPercent),
      maxWeightKg: this.roundToTenth(anchoredOneRepMax * maxPercent),
      minSets,
      maxSets,
      minReps,
      maxReps,
    };
  }

  private applyTargetPreferences(
    window: RecommendationSafetyWindow,
    dto: GeneratePlanDto,
  ) {
    const nextWindow = { ...window };

    if (typeof dto.targetSets === 'number') {
      const safeSets = this.clamp(dto.targetSets, window.minSets, window.maxSets);
      nextWindow.minSets = safeSets;
      nextWindow.maxSets = safeSets;
    }

    if (typeof dto.targetReps === 'number') {
      const safeReps = this.clamp(dto.targetReps, window.minReps, window.maxReps);
      nextWindow.minReps = safeReps;
      nextWindow.maxReps = safeReps;
    }

    return nextWindow;
  }

  private ensureAiConfigured() {
    if (!this.configService.get<string>('QWEN_API_KEY')) {
      this.logger.error('QWEN_API_KEY is missing.');
      throw new InternalServerErrorException(
        'Recommendation AI is not configured right now.',
      );
    }
  }

  private async requestStructuredJson<T>({
    systemPrompt,
    userPrompt,
    logContext,
    failureMessage,
  }: {
    systemPrompt: string;
    userPrompt: string;
    logContext: string;
    failureMessage: string;
  }): Promise<T> {
    this.ensureAiConfigured();
    this.logger.log(`Starting ${logContext}.`);

    try {
      const response = await this.client.chat.completions.create({
        model: QWEN_MODEL,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      const rawContent = this.extractMessageContent(
        response.choices[0]?.message?.content,
      );

      if (!rawContent) {
        throw new Error('The AI response was empty.');
      }

      return JSON.parse(rawContent) as T;
    } catch (error) {
      this.logger.error(
        `${logContext} failed.`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(failureMessage);
    }
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }

  private coerceInt(value: unknown, fallback: number) {
    return Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : fallback;
  }

  private coerceNumber(value: unknown, fallback: number) {
    return Number.isFinite(Number(value)) ? Number(value) : fallback;
  }

  private roundToTenth(value: number) {
    return Math.round(value * 10) / 10;
  }

  private cleanText(value: unknown, fallback: string, maxLength: number) {
    if (typeof value !== 'string') {
      return fallback;
    }

    const normalized = value.replace(/\s+/g, ' ').trim();

    if (!normalized) {
      return fallback;
    }

    return normalized.slice(0, maxLength);
  }

  private extractMessageContent(content: unknown) {
    if (typeof content === 'string') {
      return content.trim();
    }

    if (!Array.isArray(content)) {
      return '';
    }

    return content
      .map((part) => {
        if (typeof part === 'string') {
          return part;
        }

        if (
          part &&
          typeof part === 'object' &&
          'text' in part &&
          typeof part.text === 'string'
        ) {
          return part.text;
        }

        return '';
      })
      .join('')
      .trim();
  }
}
