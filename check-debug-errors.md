# Check & Debug Errors Plan

## Overview
Comprehensive system check and debugging sweep to verify Urja v1.0 stability, catch edge-case bugs, and ensure seamless performance across Web and API environments.

## Project Type
WEB / BACKEND

## Success Criteria
- 100% of P0 Security and Linting checks pass.
- E2E flows (Onboarding -> Plan Generation -> Logging) complete without 500 errors or UI crashes.
- Frontend rendering errors and console warnings resolved.
- Vercel production logs show 0 execution timeouts or unhandled exceptions.

## Tech Stack
- Typescript / React / Express
- Vercel Analytics / Serverless Logs
- Python verification scripts

## File Structure
- `apps/web/src/`
- `apps/api/src/`

## Task Breakdown

### Task 1: Comprehensive Codebase Lint & Type Check
- **Agent**: `test-engineer`
- **Skill**: `clean-code`
- **Priority**: P0
- **Dependencies**: None
- **INPUT**: Run `npm run lint` and `npx tsc --noEmit` across all workspaces.
- **OUTPUT**: Lint report and fixed minor type errors.
- **VERIFY**: Commands exit with code 0.

### Task 2: Security & Vulnerability Scan
- **Agent**: `security-auditor`
- **Skill**: `vulnerability-scanner`
- **Priority**: P0
- **Dependencies**: None
- **INPUT**: Execute `python .agent/scripts/security_scan.py .`
- **OUTPUT**: Security audit report.
- **VERIFY**: No critical or high vulnerabilities.

### Task 3: Vercel Production Log Analysis
- **Agent**: `debugger`
- **Skill**: `systematic-debugging`
- **Priority**: P1
- **Dependencies**: None
- **INPUT**: Review live Vercel function logs for any unhandled promise rejections or timeout warnings occurring after the Gemini integration.
- **OUTPUT**: List of active runtime errors and their fixes.
- **VERIFY**: Serverless functions execute within timeout limits.

### Task 4: E2E User Journey & Edge Case Testing
- **Agent**: `test-engineer`
- **Skill**: `webapp-testing`
- **Priority**: P2
- **Dependencies**: Task 3
- **INPUT**: Walk through the Critical Path (Signup -> Onboarding -> Generation -> Logging) to trap any UI state bugs.
- **OUTPUT**: Fixes for edge cases.
- **VERIFY**: Full user journey works flawlessly in production.

## Phase X: Verification
- [ ] Lint & Types: `npm run lint && npx tsc --noEmit`
- [ ] Security: `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`
- [ ] E2E Manual Sweep
