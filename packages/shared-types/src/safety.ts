import type { SafetyLevel } from './enums';
import type { UserContextObject } from './uco';

export interface SafetyRule {
    id: string;
    condition: (uco: UserContextObject) => boolean;
    action: string;
    message: string;
    setFlag?: string;
    restrictExerciseTags?: string[];
}

export interface BlockedFeature {
    feature: string;
    reason: string;
}

export interface SafetyWarning {
    code: string;
    message: string;
    severity: 'info' | 'warning' | 'critical';
}

export interface PlanModification {
    type: 'restrict_exercises' | 'reduce_intensity' | 'change_framing' | 'block_feature';
    description: string;
    params?: Record<string, unknown>;
}

export interface SafetyGateResult {
    clearance: SafetyLevel;
    blockedFeatures: BlockedFeature[];
    warnings: SafetyWarning[];
    requiredModifications: PlanModification[];
    gpReferralSuggested: boolean;
    gpReferralReason?: string;
    displayMessage?: string;
}
