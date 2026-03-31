"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RecommendationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
const auth_service_1 = require("../auth/auth.service");
const generate_plan_dto_1 = require("./dto/generate-plan.dto");
const recommendation_types_1 = require("./recommendation.types");
const set_service_1 = require("../set/set.service");
const set_types_1 = require("../set/set.types");
const QWEN_MODEL = 'openrouter/free';
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
let RecommendationService = RecommendationService_1 = class RecommendationService {
    configService;
    setService;
    authService;
    logger = new common_1.Logger(RecommendationService_1.name);
    client;
    constructor(configService, setService, authService) {
        this.configService = configService;
        this.setService = setService;
        this.authService = authService;
        this.client = this.createOpenRouterClient(this.configService.get('QWEN_API_KEY') ?? '');
    }
    async generateWorkoutPlan(userId, dto) {
        const exercise = this.setService
            .getExercises()
            .find((item) => item.id === dto.exerciseId);
        if (!exercise) {
            throw new common_1.NotFoundException(`Unknown exercise "${dto.exerciseId}".`);
        }
        const analytics = await this.setService.getPerformanceAnalytics(userId, dto.exerciseId, dto.days ?? 14);
        const safetyWindow = this.computeSafetyWindow(exercise, analytics, dto);
        const userPrompt = this.buildRecommendationPrompt(exercise, analytics.contextSummary, dto, safetyWindow);
        const connectedOpenRouter = await this.authService.getConnectedOpenRouterAccess(userId);
        const connectedOpenRouterKey = connectedOpenRouter.apiKey;
        if (!this.isAiConfigured()) {
            if (connectedOpenRouterKey) {
                try {
                    return await this.generatePlanWithApiKey(connectedOpenRouterKey, recommendation_types_1.RecommendationPlanSource.USER_OPENROUTER, exercise, dto, analytics.contextSummary, safetyWindow, userPrompt, `connected OpenRouter workout plan generation for user ${userId} and exercise ${dto.exerciseId}`);
                }
                catch (connectedKeyError) {
                    this.logger.warn(`Server OpenRouter key is missing and connected OpenRouter fallback failed for user ${userId}. Returning rule fallback.`, connectedKeyError instanceof Error
                        ? connectedKeyError.stack
                        : String(connectedKeyError));
                }
            }
            this.logger.warn(`QWEN_API_KEY is missing and no connected OpenRouter key exists for user ${userId}. Returning rule fallback.`);
            return this.buildFallbackPlan(exercise, dto, analytics.contextSummary, safetyWindow, 'Cloud recommendation provider is not configured, and no connected OpenRouter fallback is available, so a safe server fallback was used.', this.buildOpenRouterProviderNotice(connectedOpenRouter));
        }
        try {
            return await this.generatePlanWithApiKey(null, recommendation_types_1.RecommendationPlanSource.CLOUD_AI, exercise, dto, analytics.contextSummary, safetyWindow, userPrompt, `workout plan generation for user ${userId} and exercise ${dto.exerciseId}`);
        }
        catch (error) {
            if (this.isRateLimitError(error)) {
                if (connectedOpenRouterKey) {
                    this.logger.warn(`Primary OpenRouter key was rate-limited for user ${userId}. Retrying with connected OpenRouter key.`, error instanceof Error ? error.stack : String(error));
                    try {
                        return await this.generatePlanWithApiKey(connectedOpenRouterKey, recommendation_types_1.RecommendationPlanSource.USER_OPENROUTER, exercise, dto, analytics.contextSummary, safetyWindow, userPrompt, `connected OpenRouter workout plan generation for user ${userId} and exercise ${dto.exerciseId}`);
                    }
                    catch (connectedKeyError) {
                        this.logger.warn(`Connected OpenRouter fallback failed for user ${userId}. Returning rule fallback.`, connectedKeyError instanceof Error
                            ? connectedKeyError.stack
                            : String(connectedKeyError));
                        return this.buildFallbackPlan(exercise, dto, analytics.contextSummary, safetyWindow, 'Cloud quota was reached and your connected OpenRouter fallback was unavailable, so a safe server fallback was used.', this.buildOpenRouterProviderNotice(connectedOpenRouter));
                    }
                }
                this.logger.warn(`Primary OpenRouter key was rate-limited for user ${userId}, but no usable connected OpenRouter key was available.`);
                return this.buildFallbackPlan(exercise, dto, analytics.contextSummary, safetyWindow, 'Cloud quota was reached, so a safe server fallback was used.', this.buildOpenRouterProviderNotice(connectedOpenRouter));
            }
            this.logger.warn(`Cloud workout recommendation failed for user ${userId} and exercise ${dto.exerciseId}. Returning rule fallback.`, error instanceof Error ? error.stack : String(error));
            return this.buildFallbackPlan(exercise, dto, analytics.contextSummary, safetyWindow, connectedOpenRouterKey
                ? 'Cloud recommendation and your connected OpenRouter fallback were both unavailable, so a safe server fallback was used.'
                : 'Cloud recommendation is temporarily unavailable, so a safe server fallback was used.', this.buildOpenRouterProviderNotice(connectedOpenRouter));
        }
    }
    async analyzeFeatureThreats(userId, dto) {
        this.ensureAiConfigured();
        try {
            const parsed = await this.requestStructuredJson({
                systemPrompt: UNIVERSAL_ARCHITECT_SYSTEM_PROMPT,
                userPrompt: this.buildFeatureAnalysisPrompt(dto),
                logContext: `feature analysis for user ${userId}`,
            });
            return this.sanitizeFeatureThreatAnalysis(parsed, dto);
        }
        catch (error) {
            this.logger.error(`feature analysis for user ${userId} failed.`, error instanceof Error ? error.stack : String(error));
            throw new common_1.InternalServerErrorException('Unable to analyze the feature right now.');
        }
    }
    buildRecommendationPrompt(exercise, contextSummary, dto, safetyWindow) {
        const safetyEnvelope = JSON.stringify({
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            phaseGoal: dto.phaseGoal,
            minSets: safetyWindow.minSets,
            maxSets: safetyWindow.maxSets,
            minReps: safetyWindow.minReps,
            maxReps: safetyWindow.maxReps,
            minWeightKg: safetyWindow.minWeightKg,
            maxWeightKg: safetyWindow.maxWeightKg,
        }, null, 2);
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
    buildFeatureAnalysisPrompt(dto) {
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
    sanitizePlan(plan, exercise, phaseGoal, contextSummary, safetyWindow, source, providerNotice) {
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
        const routine = rawRoutine.slice(0, 1).map((entry) => {
            const sets = this.clamp(this.coerceInt(entry.sets, safetyWindow.minSets), safetyWindow.minSets, safetyWindow.maxSets);
            const reps = this.clamp(this.coerceInt(entry.reps, safetyWindow.minReps), safetyWindow.minReps, safetyWindow.maxReps);
            let prescribedWeightKg = null;
            if (safetyWindow.minWeightKg !== null &&
                safetyWindow.maxWeightKg !== null) {
                const rawWeight = this.coerceNumber(entry.prescribedWeightKg, safetyWindow.minWeightKg);
                prescribedWeightKg = this.roundToTenth(this.clamp(rawWeight, safetyWindow.minWeightKg, safetyWindow.maxWeightKg));
            }
            return {
                exercise: exercise.name,
                sets,
                reps,
                prescribedWeightKg,
                rationale: typeof entry.rationale === 'string' && entry.rationale.trim().length > 0
                    ? entry.rationale.trim()
                    : 'Server-sanitized routine inside the approved safety window.',
            };
        });
        return {
            phaseGoal,
            source,
            rationale: typeof plan.rationale === 'string' && plan.rationale.trim().length > 0
                ? this.cleanText(plan.rationale, contextSummary, 400)
                : contextSummary,
            contextSummary,
            providerNotice: providerNotice ?? null,
            safetyWindow,
            routine,
        };
    }
    buildFallbackPlan(exercise, dto, contextSummary, safetyWindow, reason, providerNotice) {
        const sets = this.selectFallbackSets(dto.phaseGoal, safetyWindow);
        const reps = this.selectFallbackReps(dto.phaseGoal, safetyWindow);
        return {
            phaseGoal: dto.phaseGoal,
            source: recommendation_types_1.RecommendationPlanSource.RULE_FALLBACK,
            rationale: this.cleanText(reason, contextSummary, 400),
            contextSummary,
            providerNotice: providerNotice ?? null,
            safetyWindow,
            routine: [
                {
                    exercise: exercise.name,
                    sets,
                    reps,
                    prescribedWeightKg: this.selectFallbackWeight(dto.phaseGoal, safetyWindow),
                    rationale: this.buildFallbackEntryRationale(dto.phaseGoal),
                },
            ],
        };
    }
    sanitizeFeatureThreatAnalysis(analysis, dto) {
        const fallbackFeatureName = dto.featureName ??
            this.cleanText(dto.featureRequest, 'Feature analysis', 80);
        const implementationSteps = (Array.isArray(analysis.implementationSteps) && analysis.implementationSteps.length > 0
            ? analysis.implementationSteps
            : [
                {
                    step: '1',
                    action: 'Define the module boundary.',
                    technicalDetail: 'Create a dedicated NestJS module, controller, service, DTOs, and persistence boundaries before adding transport-specific logic.',
                },
            ])
            .slice(0, 8)
            .map((step, index) => ({
            step: this.cleanText(typeof step.step === 'number' ? String(step.step) : step.step, String(index + 1), 24),
            action: this.cleanText(step.action, 'Define the core implementation step.', 220),
            technicalDetail: this.cleanText(step.technicalDetail, 'Specify the NestJS, TypeScript, data, validation, or async pattern that should be used.', 500),
        }));
        const dangerousProblems = (Array.isArray(analysis.dangerousProblems) && analysis.dangerousProblems.length > 0
            ? analysis.dangerousProblems
            : [
                {
                    threatName: 'Specification Drift',
                    theThreat: 'If requirements are not pinned to DTOs, validation, and persistence rules, different endpoints can silently diverge and corrupt behavior.',
                    theFix: 'Lock the contract with DTO validation, a dedicated module boundary, and one canonical service layer before exposing the feature broadly.',
                },
            ])
            .slice(0, 8)
            .map((problem) => ({
            threatName: this.cleanText(problem.threatName, 'Unspecified Threat', 120),
            theThreat: this.cleanText(problem.theThreat, 'The threat was not fully described by the model.', 700),
            theFix: this.cleanText(problem.theFix, 'Define a concrete architectural fix before implementation starts.', 700),
        }));
        return {
            featureName: this.cleanText(analysis.featureName, fallbackFeatureName, 120),
            executiveSummary: this.cleanText(analysis.executiveSummary, 'Build the feature behind strict NestJS boundaries, preserve data integrity, and neutralize high-risk failure modes before scaling it.', 500),
            implementationSteps,
            dangerousProblems,
        };
    }
    computeSafetyWindow(exercise, analytics, dto) {
        const anchoredOneRepMax = analytics.emaOneRepMaxKg ??
            analytics.baselineAverageOneRepMaxKg ??
            analytics.latestCleanOneRepMaxKg ??
            analytics.latestLoggedOneRepMaxKg;
        if (exercise.category === set_types_1.SetExerciseCategory.METABOLIC_CARDIO ||
            anchoredOneRepMax === null) {
            return this.getColdStartWindow(dto.phaseGoal);
        }
        const fatigueAdjustment = analytics.latestSessionFlagged ? 0.05 : 0;
        switch (dto.phaseGoal) {
            case generate_plan_dto_1.RecommendationPhaseGoal.STRENGTH:
                return this.applyTargetPreferences(this.createWeightedWindow(anchoredOneRepMax, 0.78 - fatigueAdjustment, 0.87 - fatigueAdjustment, 3, analytics.latestSessionFlagged ? 4 : 5, 3, 5), dto);
            case generate_plan_dto_1.RecommendationPhaseGoal.POWER:
                return this.applyTargetPreferences(this.createWeightedWindow(anchoredOneRepMax, 0.55 - fatigueAdjustment, 0.7 - fatigueAdjustment, 3, 5, 2, 4), dto);
            case generate_plan_dto_1.RecommendationPhaseGoal.RECOVERY:
                return this.applyTargetPreferences(this.createWeightedWindow(anchoredOneRepMax, 0.5, 0.6, 2, 3, 5, 8), dto);
            case generate_plan_dto_1.RecommendationPhaseGoal.BASELINE_TESTING:
                return this.applyTargetPreferences(this.createWeightedWindow(anchoredOneRepMax, 0.55, 0.65, 3, 4, 4, 6), dto);
            case generate_plan_dto_1.RecommendationPhaseGoal.HYPERTROPHY:
            default:
                return this.applyTargetPreferences(this.createWeightedWindow(anchoredOneRepMax, 0.65 - fatigueAdjustment, 0.75 - fatigueAdjustment, 3, analytics.latestSessionFlagged ? 4 : 5, 8, 12), dto);
        }
    }
    getColdStartWindow(phaseGoal) {
        switch (phaseGoal) {
            case generate_plan_dto_1.RecommendationPhaseGoal.STRENGTH:
                return {
                    minWeightKg: null,
                    maxWeightKg: null,
                    minSets: 3,
                    maxSets: 4,
                    minReps: 3,
                    maxReps: 5,
                };
            case generate_plan_dto_1.RecommendationPhaseGoal.POWER:
                return {
                    minWeightKg: null,
                    maxWeightKg: null,
                    minSets: 3,
                    maxSets: 4,
                    minReps: 2,
                    maxReps: 4,
                };
            case generate_plan_dto_1.RecommendationPhaseGoal.RECOVERY:
                return {
                    minWeightKg: null,
                    maxWeightKg: null,
                    minSets: 2,
                    maxSets: 3,
                    minReps: 5,
                    maxReps: 8,
                };
            case generate_plan_dto_1.RecommendationPhaseGoal.BASELINE_TESTING:
            case generate_plan_dto_1.RecommendationPhaseGoal.HYPERTROPHY:
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
    createWeightedWindow(anchoredOneRepMax, minPercent, maxPercent, minSets, maxSets, minReps, maxReps) {
        return {
            minWeightKg: this.roundToTenth(anchoredOneRepMax * minPercent),
            maxWeightKg: this.roundToTenth(anchoredOneRepMax * maxPercent),
            minSets,
            maxSets,
            minReps,
            maxReps,
        };
    }
    applyTargetPreferences(window, dto) {
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
    selectFallbackSets(phaseGoal, safetyWindow) {
        switch (phaseGoal) {
            case generate_plan_dto_1.RecommendationPhaseGoal.STRENGTH:
            case generate_plan_dto_1.RecommendationPhaseGoal.HYPERTROPHY:
                return safetyWindow.maxSets;
            case generate_plan_dto_1.RecommendationPhaseGoal.POWER:
            case generate_plan_dto_1.RecommendationPhaseGoal.BASELINE_TESTING:
            case generate_plan_dto_1.RecommendationPhaseGoal.RECOVERY:
            default:
                return safetyWindow.minSets;
        }
    }
    selectFallbackReps(phaseGoal, safetyWindow) {
        switch (phaseGoal) {
            case generate_plan_dto_1.RecommendationPhaseGoal.STRENGTH:
            case generate_plan_dto_1.RecommendationPhaseGoal.POWER:
                return safetyWindow.minReps;
            case generate_plan_dto_1.RecommendationPhaseGoal.HYPERTROPHY:
            case generate_plan_dto_1.RecommendationPhaseGoal.RECOVERY:
                return safetyWindow.maxReps;
            case generate_plan_dto_1.RecommendationPhaseGoal.BASELINE_TESTING:
            default:
                return this.coerceInt(Math.round((safetyWindow.minReps + safetyWindow.maxReps) / 2), safetyWindow.minReps);
        }
    }
    selectFallbackWeight(phaseGoal, safetyWindow) {
        if (safetyWindow.minWeightKg === null ||
            safetyWindow.maxWeightKg === null) {
            return null;
        }
        switch (phaseGoal) {
            case generate_plan_dto_1.RecommendationPhaseGoal.STRENGTH:
                return safetyWindow.maxWeightKg;
            case generate_plan_dto_1.RecommendationPhaseGoal.POWER:
            case generate_plan_dto_1.RecommendationPhaseGoal.BASELINE_TESTING:
                return this.roundToTenth((safetyWindow.minWeightKg + safetyWindow.maxWeightKg) / 2);
            case generate_plan_dto_1.RecommendationPhaseGoal.RECOVERY:
                return safetyWindow.minWeightKg;
            case generate_plan_dto_1.RecommendationPhaseGoal.HYPERTROPHY:
            default:
                return this.roundToTenth(safetyWindow.minWeightKg +
                    (safetyWindow.maxWeightKg - safetyWindow.minWeightKg) * 0.6);
        }
    }
    buildFallbackEntryRationale(phaseGoal) {
        switch (phaseGoal) {
            case generate_plan_dto_1.RecommendationPhaseGoal.STRENGTH:
                return 'Server fallback keeps the session heavy but inside the approved strength envelope.';
            case generate_plan_dto_1.RecommendationPhaseGoal.POWER:
                return 'Server fallback keeps the session crisp and explosive inside the approved power envelope.';
            case generate_plan_dto_1.RecommendationPhaseGoal.RECOVERY:
                return 'Server fallback keeps the session light and conservative while the cloud model is unavailable.';
            case generate_plan_dto_1.RecommendationPhaseGoal.BASELINE_TESTING:
                return 'Server fallback preserves a neutral baseline session inside the approved range.';
            case generate_plan_dto_1.RecommendationPhaseGoal.HYPERTROPHY:
            default:
                return 'Server fallback keeps volume productive while staying inside the approved hypertrophy envelope.';
        }
    }
    isRateLimitError(error) {
        if (error instanceof openai_1.default.APIError) {
            return error.status === 429;
        }
        if (error &&
            typeof error === 'object' &&
            'status' in error &&
            Number(error.status) === 429) {
            return true;
        }
        if (error instanceof Error) {
            return /429|rate limit/i.test(error.message);
        }
        return false;
    }
    buildOpenRouterProviderNotice(connectedOpenRouter) {
        if (connectedOpenRouter.status === 'decrypt_failed') {
            return 'Your connected OpenRouter key could not be decrypted. Reconnect OpenRouter in Profile to restore the second-layer fallback.';
        }
        if (connectedOpenRouter.status === 'missing') {
            return 'Connect OpenRouter in Profile to enable the second-layer fallback when the shared server quota is hit.';
        }
        return null;
    }
    createOpenRouterClient(apiKey) {
        return new openai_1.default({
            apiKey,
            baseURL: QWEN_BASE_URL,
            timeout: QWEN_TIMEOUT_MS,
            maxRetries: 2,
            defaultHeaders: {
                'HTTP-Referer': this.getFrontendBaseUrl(),
                'X-Title': 'relive-ai',
            },
        });
    }
    async generatePlanWithApiKey(apiKeyOverride, source, exercise, dto, contextSummary, safetyWindow, userPrompt, logContext) {
        const parsed = await this.requestStructuredJson({
            systemPrompt: WORKOUT_RECOMMENDATION_SYSTEM_PROMPT,
            userPrompt,
            logContext,
            apiKeyOverride,
        });
        return this.sanitizePlan(parsed, exercise, dto.phaseGoal, contextSummary, safetyWindow, source, null);
    }
    getFrontendBaseUrl() {
        return (this.configService.get('FRONTEND_URL') ??
            this.configService.get('APP_FRONTEND_URL') ??
            'http://localhost:3000');
    }
    isAiConfigured() {
        return Boolean(this.configService.get('QWEN_API_KEY'));
    }
    ensureAiConfigured() {
        if (!this.isAiConfigured()) {
            this.logger.error('QWEN_API_KEY is missing.');
            throw new common_1.InternalServerErrorException('Recommendation AI is not configured right now.');
        }
    }
    async requestStructuredJson({ systemPrompt, userPrompt, logContext, apiKeyOverride, }) {
        const client = apiKeyOverride
            ? this.createOpenRouterClient(apiKeyOverride)
            : this.client;
        if (!apiKeyOverride) {
            this.ensureAiConfigured();
        }
        this.logger.log(`Starting ${logContext}.`);
        try {
            const response = await client.chat.completions.create({
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
            const rawContent = this.extractMessageContent(response.choices[0]?.message?.content);
            if (!rawContent) {
                throw new Error('The AI response was empty.');
            }
            return JSON.parse(rawContent);
        }
        catch (error) {
            this.logger.error(`${logContext} failed.`, error instanceof Error ? error.stack : String(error));
            throw error;
        }
    }
    clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }
    coerceInt(value, fallback) {
        return Number.isFinite(Number(value)) ? Math.trunc(Number(value)) : fallback;
    }
    coerceNumber(value, fallback) {
        return Number.isFinite(Number(value)) ? Number(value) : fallback;
    }
    roundToTenth(value) {
        return Math.round(value * 10) / 10;
    }
    cleanText(value, fallback, maxLength) {
        if (typeof value !== 'string') {
            return fallback;
        }
        const normalized = value.replace(/\s+/g, ' ').trim();
        if (!normalized) {
            return fallback;
        }
        return normalized.slice(0, maxLength);
    }
    extractMessageContent(content) {
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
            if (part &&
                typeof part === 'object' &&
                'text' in part &&
                typeof part.text === 'string') {
                return part.text;
            }
            return '';
        })
            .join('')
            .trim();
    }
};
exports.RecommendationService = RecommendationService;
exports.RecommendationService = RecommendationService = RecommendationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        set_service_1.SetService,
        auth_service_1.AuthService])
], RecommendationService);
//# sourceMappingURL=recommendation.service.js.map