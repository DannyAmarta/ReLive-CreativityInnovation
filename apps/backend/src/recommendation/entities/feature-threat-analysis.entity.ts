import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FeatureImplementationStepEntity {
  @Field()
  step: string;

  @Field()
  action: string;

  @Field()
  technicalDetail: string;
}

@ObjectType()
export class FeatureDangerousProblemEntity {
  @Field()
  threatName: string;

  @Field()
  theThreat: string;

  @Field()
  theFix: string;
}

@ObjectType()
export class FeatureThreatAnalysisEntity {
  @Field()
  featureName: string;

  @Field()
  executiveSummary: string;

  @Field(() => [FeatureImplementationStepEntity])
  implementationSteps: FeatureImplementationStepEntity[];

  @Field(() => [FeatureDangerousProblemEntity])
  dangerousProblems: FeatureDangerousProblemEntity[];
}
