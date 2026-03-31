export declare class FeatureImplementationStepEntity {
    step: string;
    action: string;
    technicalDetail: string;
}
export declare class FeatureDangerousProblemEntity {
    threatName: string;
    theThreat: string;
    theFix: string;
}
export declare class FeatureThreatAnalysisEntity {
    featureName: string;
    executiveSummary: string;
    implementationSteps: FeatureImplementationStepEntity[];
    dangerousProblems: FeatureDangerousProblemEntity[];
}
