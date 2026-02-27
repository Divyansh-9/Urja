import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth';
import type { UserContextObject, SafetyGateResult } from '@fitmind/shared-types';

export interface UCORequest extends AuthRequest {
    uco?: UserContextObject;
}

const HIGH_RISK_MEDS = [
    'warfarin', 'insulin', 'lithium', 'methotrexate', 'digoxin',
    'prednisone', 'chemotherapy', 'beta-blockers', 'ssri', 'snri',
];

/**
 * Safety Gate: deterministic rules engine that runs BEFORE any plan generation.
 * NOT AI — pure rule-based logic. Conservative by default.
 */
export function runSafetyGate(uco: UserContextObject): SafetyGateResult {
    const result: SafetyGateResult = {
        clearance: 'full',
        blockedFeatures: [],
        warnings: [],
        requiredModifications: [],
        gpReferralSuggested: false,
    };

    // Rule 1: Eating disorder risk
    if (uco.health.eatingDisorderRisk) {
        result.clearance = 'modified';
        result.blockedFeatures.push({
            feature: 'caloric_deficit',
            reason: 'Eating disorder risk detected',
        });
        result.requiredModifications.push({
            type: 'change_framing',
            description: 'Reframe from "weight loss" to "health & energy"',
        });
        result.requiredModifications.push({
            type: 'block_feature',
            description: 'Hide target weight field',
        });
        result.warnings.push({
            code: 'ED_RISK',
            message: 'Support resources will be shown',
            severity: 'critical',
        });
    }

    // Rule 2: Severely underweight
    if (uco.physical.bmi < 16) {
        result.clearance = 'modified';
        result.gpReferralSuggested = true;
        result.gpReferralReason = 'BMI below 16 — medical evaluation recommended';
        result.blockedFeatures.push({
            feature: 'weight_loss_goal',
            reason: 'BMI critically low',
        });
        result.requiredModifications.push({
            type: 'change_framing',
            description: 'Redirect to maintenance/health program only',
        });
    }

    // Rule 3: Active spinal injury
    const activeSpineInjury = uco.health.injuries.some(
        (i) => i.bodyPart === 'spine' && i.isActive,
    );
    if (activeSpineInjury) {
        result.clearance = result.clearance === 'full' ? 'modified' : result.clearance;
        result.requiredModifications.push({
            type: 'restrict_exercises',
            description: 'Spine injury — high-load spinal exercises excluded',
            params: { excludeTags: ['spinal_load', 'deadlift', 'squat_barbell', 'overhead_press'] },
        });
    }

    // Rule 4: Active knee injury
    const activeKneeInjury = uco.health.injuries.some(
        (i) => (i.bodyPart === 'knee' || i.bodyPart === 'knees') && i.isActive,
    );
    if (activeKneeInjury) {
        result.clearance = result.clearance === 'full' ? 'modified' : result.clearance;
        result.requiredModifications.push({
            type: 'restrict_exercises',
            description: 'Knee injury — impact and heavy leg exercises excluded',
            params: { excludeTags: ['high_impact', 'jump', 'deep_squat', 'lunge_heavy'] },
        });
    }

    // Rule 5: High-risk medications
    const hasHighRiskMeds = uco.health.medications.some((med) =>
        HIGH_RISK_MEDS.some((risk) => med.toLowerCase().includes(risk)),
    );
    if (hasHighRiskMeds) {
        result.gpReferralSuggested = true;
        result.gpReferralReason = 'On high-risk medication — consult doctor before starting';
        result.warnings.push({
            code: 'MED_FLAG',
            message: 'Consult doctor before starting program',
            severity: 'warning',
        });
    }

    // Rule 6: Severe obesity
    if (uco.physical.bmi > 40) {
        result.clearance = result.clearance === 'full' ? 'modified' : result.clearance;
        result.requiredModifications.push({
            type: 'restrict_exercises',
            description: 'High-impact exercises modified for joint safety',
            params: { excludeTags: ['high_impact', 'jump', 'run'] },
        });
        result.warnings.push({
            code: 'OBESITY_MODIFIED',
            message: 'Plan adjusted for joint safety — low-impact exercises prioritized',
            severity: 'info',
        });
    }

    // Rule 7: Extreme stress
    if (uco.lifestyle.stressLevel >= 5) {
        result.warnings.push({
            code: 'HIGH_STRESS',
            message: 'High stress detected — plan intensity reduced, recovery exercises added',
            severity: 'warning',
        });
        result.requiredModifications.push({
            type: 'reduce_intensity',
            description: 'Reduce overall volume by 30%, prioritize yoga/walking',
        });
    }

    // Rule 8: Very low sleep
    if (uco.lifestyle.sleepHours < 5) {
        result.warnings.push({
            code: 'LOW_SLEEP',
            message: 'Sleep below 5 hours — intensity reduced to prevent overtraining',
            severity: 'warning',
        });
        result.requiredModifications.push({
            type: 'reduce_intensity',
            description: 'Cap workout intensity at moderate until sleep improves',
        });
    }

    // Generate display message
    if (result.clearance === 'blocked') {
        result.displayMessage = 'Your plan generation is paused for safety. Please consult a healthcare professional.';
    } else if (result.clearance === 'modified') {
        result.displayMessage = 'Your plan has been adjusted for your safety. See details below.';
    }

    return result;
}

/**
 * Safety Gate middleware — runs on plan generation routes.
 */
export function safetyGateMiddleware(req: UCORequest, res: Response, next: NextFunction) {
    if (!req.uco) return next();

    const safety = runSafetyGate(req.uco);
    (req as any).safetyResult = safety;

    if (safety.clearance === 'blocked') {
        return res.status(403).json({
            success: false,
            error: {
                code: 'SAFETY_BLOCKED',
                message: safety.displayMessage,
                details: {
                    gpReferralSuggested: safety.gpReferralSuggested,
                    gpReferralReason: safety.gpReferralReason,
                    blockedFeatures: safety.blockedFeatures,
                },
            },
        });
    }

    next();
}
