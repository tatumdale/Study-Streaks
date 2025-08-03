# JIRA-Integrated Git Branching Strategy - Study Streaks

## Overview

Study Streaks uses a **JIRA-integrated Git Flow** strategy optimized for educational compliance, continuous integration, and safe deployment to production environments handling children's data. This strategy ensures complete traceability from JIRA issues to code changes while supporting multiple developers working simultaneously.

## JIRA Integration Requirements

### Core Integration Principles
- **Mandatory JIRA References**: All branches must include JIRA issue references (CPG-xxx format)
- **Traceability**: Complete audit trail from commits to JIRA issues
- **Automated Linking**: PR titles automatically reference JIRA issues
- **Parallel Development**: Support for multiple feature branches working simultaneously
- **Issue Tracking**: Easy identification of which code changes relate to specific JIRA issues

### JIRA Project Configuration
- **Project Key**: `CPG` (Comprehensive Primary Gamification)
- **Issue Types**: Epic, Story, Task, Bug, Sub-task, Spike
- **Standard Workflow**: To Do → In Progress → Code Review → Testing → Done
- **Priority Levels**: Highest, High, Medium, Low, Lowest

## Branch Structure

### Main Branches

#### `master` (Production)
- **Purpose**: Production-ready code deployed to live environment
- **Protection**: Heavily protected, requires PR reviews and CI/CD checks
- **Deployment**: Automatically deploys to production
- **Naming**: `master`
- **Lifetime**: Permanent
- **JIRA Integration**: Release notes automatically generated from merged issues

#### `develop` (Development Integration)
- **Purpose**: Integration branch for all development work
- **Protection**: Moderate protection, requires CI checks
- **Deployment**: Automatically deploys to staging environment
- **Naming**: `develop`
- **Lifetime**: Permanent
- **JIRA Integration**: Issues transition to "Testing" when merged

### Supporting Branches

#### Feature Branches
- **Purpose**: Development of new features or enhancements
- **Base**: `develop`
- **Merge Target**: `develop` via Pull Request
- **Naming Convention**: `feature/CPG-123-user-authentication`
- **Lifetime**: Temporary (deleted after merge)
- **JIRA Integration**: 
  - Branch name must match active JIRA issue
  - Issue transitions to "In Progress" when branch is created
  - Issue includes link to branch/PR

#### Bugfix Branches
- **Purpose**: Non-critical bug fixes during development
- **Base**: `develop`
- **Merge Target**: `develop` via Pull Request
- **Naming Convention**: `bugfix/CPG-124-login-validation-error`
- **Lifetime**: Temporary (deleted after merge)
- **JIRA Integration**: Links to Bug issue type in JIRA

#### Hotfix Branches
- **Purpose**: Critical production fixes that cannot wait for next release
- **Base**: `master`
- **Merge Target**: Both `master` and `develop`
- **Naming Convention**: `hotfix/CPG-125-security-vulnerability-patch`
- **Lifetime**: Temporary (deleted after merge)
- **JIRA Integration**: 
  - High/Highest priority issues only
  - Immediate notification to stakeholders
  - Post-merge issue analysis required

#### Release Branches
- **Purpose**: Prepare releases, minor bug fixes, and metadata updates
- **Base**: `develop`
- **Merge Target**: Both `master` and `develop`
- **Naming Convention**: `release/v1.2.0-CPG-126`
- **Lifetime**: Temporary (deleted after merge)
- **JIRA Integration**: 
  - Release epic tracks all included issues
  - Automatic release notes generation
  - Version tracking in JIRA

#### Spike/Research Branches
- **Purpose**: Research, proof of concepts, technical investigations
- **Base**: `develop`
- **Merge Target**: `develop` via Pull Request (optional)
- **Naming Convention**: `spike/CPG-127-database-performance-analysis`
- **Lifetime**: Temporary (may be discarded)
- **JIRA Integration**: Links to Spike issue type

## Enhanced Branch Naming Conventions

### Mandatory Format
```
<type>/CPG-<issue-number>-<short-description>
```

### Branch Types with JIRA Integration
- `feature/CPG-xxx` - New functionality (Story/Epic)
- `bugfix/CPG-xxx` - Bug fixes (Bug)
- `hotfix/CPG-xxx` - Critical production fixes (Bug - High/Highest)
- `release/v.x.x.x-CPG-xxx` - Release preparation (Epic)
- `docs/CPG-xxx` - Documentation updates (Task)
- `chore/CPG-xxx` - Maintenance tasks (Task)
- `test/CPG-xxx` - Test improvements (Task)
- `spike/CPG-xxx` - Research/investigation (Spike)
- `refactor/CPG-xxx` - Code refactoring (Task)
- `performance/CPG-xxx` - Performance improvements (Task)

### Validation Rules
1. **Mandatory JIRA ID**: All branches must include valid CPG-xxx reference
2. **Issue Status**: JIRA issue must be in "To Do" or "In Progress" status
3. **Issue Assignment**: Issue should be assigned to branch creator
4. **Description Length**: Short description limited to 50 characters
5. **Lowercase**: All descriptions use lowercase with hyphens
6. **Manual Label Check**: Issues with "Manual" label require explicit user approval for AI tools

### Valid Examples
```bash
feature/CPG-123-user-dashboard-redesign
bugfix/CPG-124-streak-calculation-weekend-bug
hotfix/CPG-125-gdpr-data-deletion-fix
release/v2.1.0-CPG-126-february-release
docs/CPG-127-api-endpoint-documentation
chore/CPG-128-dependency-security-updates
test/CPG-129-e2e-authentication-coverage
spike/CPG-130-ai-homework-detection-research
refactor/CPG-131-user-service-architecture
performance/CPG-132-database-query-optimization
```

### Invalid Examples (Will be rejected)
```bash
feature/user-dashboard              # Missing JIRA reference
feature/CPG-123                     # Missing description
feature/CPG-999-User-Dashboard      # Invalid issue or wrong case
bugfix/login-fix                    # Missing JIRA reference
hotfix/CPG-124-very-long-description-that-exceeds-the-fifty-character-limit
```

## AI Tool Integration & Manual Label Policy

### Manual Label Functionality
StudyStreaks implements a sophisticated AI tool management system using JIRA labels to control autonomous development:

#### **Manual Label Rules**
- **Label**: `Manual` (case-sensitive)
- **Purpose**: Prevents AI tools (Claude Code, Cursor, etc.) from working on issues autonomously
- **Scope**: Issues labeled "Manual" require explicit human approval before AI intervention
- **Implementation**: AI tools must check for this label before proceeding with any work

#### **AI Tool Behavior**
```yaml
# AI Tool Decision Matrix
Issue Status:
  - Has "Manual" label: ❌ STOP - Require explicit user permission
  - No "Manual" label: ✅ PROCEED - Autonomous work allowed
  - Explicit user override: ✅ PROCEED - User has given permission

# Example Scenarios
CPG-123 (no labels): AI can work autonomously
CPG-124 + "Manual": AI must ask user permission first  
CPG-125 + "Manual" + user says "yes": AI can proceed
```

#### **When to Use Manual Label**
- **Sensitive Features**: Authentication, payment processing, data privacy
- **Complex Architecture**: Major system changes requiring human oversight
- **Client Requirements**: Features needing specific business logic review
- **Security Concerns**: Any functionality touching user data or permissions
- **UI/UX Critical**: User-facing changes requiring design review

#### **AI Tool Implementation**
AI tools should implement this check pattern:
```javascript
// Pseudo-code for AI tool integration
async function checkIssuePermissions(issueId) {
  const issue = await jira.getIssue(`CPG-${issueId}`);
  const hasManualLabel = issue.fields.labels.includes('Manual');
  
  if (hasManualLabel && !userHasExplicitlyApproved) {
    throw new Error(`Issue CPG-${issueId} requires manual approval due to "Manual" label`);
  }
  
  return true; // Safe to proceed
}
```

#### **User Override Process**
When AI encounters a "Manual" labeled issue:
1. **Notify User**: "CPG-123 has 'Manual' label - requires your approval"
2. **Wait for Confirmation**: User must explicitly say "yes" or "proceed"
3. **Document Override**: Log that user approved manual intervention
4. **Proceed**: AI can now work on the issue with full permissions

This system enables **autonomous AI development** while maintaining **human control** over sensitive or complex features.

## JIRA-Integrated Workflows

### 1. Feature Development with JIRA Integration

```bash
# 1. Assign JIRA issue to yourself and move to "In Progress"
# 2. Validate issue exists and is properly assigned

# 3. Start from develop
git checkout develop
git pull origin develop

# 4. Create feature branch (must match JIRA issue)
git checkout -b feature/CPG-123-user-dashboard-redesign

# 5. Work on feature with JIRA-linked commits
git add .
git commit -m "feat(dashboard): implement user profile section

- Add user avatar display
- Implement streak statistics widget
- Add homework completion chart

Closes CPG-123"

# 6. Push and create PR with auto-JIRA linking
git push origin feature/CPG-123-user-dashboard-redesign

# 7. Create PR with title format: "CPG-123: User Dashboard Redesign"
```

### 2. Pull Request Workflow with JIRA Integration

#### PR Title Format (Auto-generated)
```
CPG-<issue-number>: <Issue Title from JIRA>
```

#### PR Description Template
```markdown
## JIRA Issue
**Issue**: [CPG-123: User Dashboard Redesign](https://studystreaks.atlassian.net/browse/CPG-123)
**Issue Type**: Story
**Priority**: Medium
**Assignee**: @developer-name

## Summary
Brief description of changes made to resolve the JIRA issue.

## Changes Made
- [ ] Feature 1 implemented
- [ ] Feature 2 implemented
- [ ] Tests added/updated
- [ ] Documentation updated

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Acceptance criteria verified

## JIRA Issue Checklist
- [ ] All acceptance criteria met
- [ ] Issue ready for QA/Testing
- [ ] Documentation updated if required
- [ ] Security considerations addressed (if applicable)

## Screenshots/Demo
(Include screenshots or demo links if UI changes)

---
**Auto-generated from JIRA issue CPG-123**
```

### 3. Multi-Feature Parallel Development

```bash
# Developer A working on user authentication
git checkout develop
git pull origin develop
git checkout -b feature/CPG-140-oauth-integration

# Developer B working on homework upload
git checkout develop  
git pull origin develop
git checkout -b feature/CPG-141-photo-evidence-upload

# Developer C working on streak calculation
git checkout develop
git pull origin develop  
git checkout -b feature/CPG-142-weekend-streak-logic

# All can work simultaneously without conflicts
# JIRA tracks progress independently for each issue
```

### 4. Release Process with JIRA Integration

```bash
# 1. Create release epic in JIRA (CPG-150: February 2024 Release)
# 2. Add all stories/bugs to release epic

# 3. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v2.1.0-CPG-150-february-release

# 4. Update version numbers, CHANGELOG (auto-generated from JIRA)
npm version minor  # Updates to v2.1.0
npm run changelog:generate  # Generates from JIRA issues

# 5. Only critical bug fixes allowed (must have JIRA tickets)
git checkout -b bugfix/CPG-151-release-critical-login-fix
# Fix bug, commit, merge back to release branch

# 6. Merge to master with JIRA release notes
git checkout master
git merge --no-ff release/v2.1.0-CPG-150-february-release
git tag -a v2.1.0 -m "Release v2.1.0 - February 2024

JIRA Epic: CPG-150
Release Notes: Auto-generated from JIRA issues"

# 7. Deploy and update JIRA
# - Deploy to production
# - Mark release epic as "Done"
# - Transition all included issues to "Done"
# - Generate release report in JIRA
```

### 5. Hotfix Process with JIRA Integration

```bash
# 1. Create critical bug in JIRA (Priority: Highest)
# 2. Assign and move to "In Progress"

# 3. Create hotfix from master
git checkout master
git pull origin master
git checkout -b hotfix/CPG-160-security-vulnerability-patch

# 4. Apply minimal fix with JIRA reference
git commit -m "fix(security): patch authentication vulnerability

- Apply security patch for token validation
- Add additional input sanitization
- Update security headers

Critical fix for CPG-160
Security-Impact: High"

# 5. Emergency review and merge process
# - Create PR immediately
# - Request emergency review
# - Deploy to staging for verification
# - Fast-track to production

# 6. Post-hotfix JIRA updates
# - Update issue with resolution details
# - Create post-mortem task
# - Update security documentation
```

## Commit Message Convention with JIRA Integration

### Enhanced Format with JIRA References
```
<type>(<scope>): <description>

[optional body]

[JIRA references]
[optional footer(s)]
```

### JIRA Reference Formats
```bash
# Single issue reference
Closes CPG-123

# Multiple issues
Relates-to: CPG-123, CPG-124
Closes: CPG-125

# Partial work
Part-of: CPG-126

# Bug fixes
Fixes: CPG-127
```

### Complete Commit Examples
```bash
feat(auth): implement OAuth2 integration with Google

- Add Google OAuth2 provider configuration
- Implement user profile mapping from Google
- Add error handling for OAuth failures
- Update authentication middleware

Closes CPG-140

fix(streaks): correct weekend gap calculation

The previous logic incorrectly reset streaks when students
didn't complete homework on weekends, which are non-school days.

- Update streak calculation to skip weekends
- Add unit tests for weekend scenarios
- Update streak display logic

Fixes CPG-141
Testing: Manual verification with weekend data
```

## Branch Protection Rules with JIRA Validation

### Master Branch Protection
```yaml
# GitHub branch protection settings
protection_rules:
  master:
    required_status_checks:
      strict: true
      contexts:
        - "ci/build"
        - "ci/test"
        - "ci/security-scan"
        - "jira/issue-validation"
        - "jira/issue-testing-complete"
    enforce_admins: true
    required_pull_request_reviews:
      required_approving_review_count: 2
      dismiss_stale_reviews: true
      require_code_owner_reviews: true
      required_review_from_codeowners: true
    restrictions:
      users: []
      teams: ["senior-developers", "tech-leads"]
    required_linear_history: true
    allow_force_pushes: false
    allow_deletions: false
```

### Develop Branch Protection
```yaml
develop:
  required_status_checks:
    strict: true
    contexts:
      - "ci/build"
      - "ci/test"
      - "jira/issue-validation"
  required_pull_request_reviews:
    required_approving_review_count: 1
  allow_force_pushes: false
```

### Feature Branch Validation
```yaml
feature_branches:
  pattern: "feature/CPG-*"
  required_checks:
    - "jira/issue-exists"
    - "jira/issue-assigned"
    - "jira/issue-in-progress"
    - "branch-name-format"
```

## JIRA-Enhanced Automated Checks

### All Pull Requests
- ✅ **JIRA Issue Validation**: Issue exists and is valid
- ✅ **Issue Assignment**: Issue assigned to PR author
- ✅ **Issue Status**: Issue in appropriate status
- ✅ **Branch Naming**: Follows JIRA naming convention
- ✅ **Linting**: ESLint, Prettier
- ✅ **Type Checking**: TypeScript
- ✅ **Unit Tests**: All tests pass
- ✅ **Integration Tests**: Integration tests pass
- ✅ **Security Scan**: Snyk/CodeQL
- ✅ **Accessibility**: axe-core compliance
- ✅ **GDPR Compliance**: Data protection checks

### Release/Hotfix Additional Checks
- ✅ **JIRA Epic Validation**: All issues linked to release epic
- ✅ **Issue Completion**: All acceptance criteria met
- ✅ **E2E Tests**: End-to-end tests pass
- ✅ **Performance**: No regression detected
- ✅ **Database Migration**: Migration tests pass
- ✅ **Documentation**: Updated and validated
- ✅ **Release Notes**: Auto-generated from JIRA

## Environment Mapping with JIRA Integration

```
master     → Production    (studystreaks.co.uk)
  ├── JIRA: Issues marked "Done"
  ├── Release: Tagged with version + JIRA epic
  └── Deployment: Automated with JIRA notifications

develop    → Staging       (staging.studystreaks.co.uk)
  ├── JIRA: Issues moved to "Testing"
  ├── QA: Ready for acceptance testing
  └── Integration: All features merged

feature/*  → Preview       (pr-123.studystreaks.dev)
  ├── JIRA: Issues in "Code Review"
  ├── Preview: Available for stakeholder review
  └── Testing: Developer testing complete
```

## Developer Workflow Examples

### Example 1: Starting New Feature Work

```bash
# 1. Check JIRA for assigned issues
echo "📋 Current assigned issues:"
curl -s -H "Authorization: Bearer $JIRA_TOKEN" \
  "$JIRA_URL/rest/api/2/search?jql=assignee=currentUser()AND status='To Do'"

# 2. Select issue CPG-200: "Implement Homework Photo Upload"
# 3. Move issue to "In Progress" in JIRA UI

# 4. Create and switch to feature branch
git checkout develop
git pull origin develop
git checkout -b feature/CPG-200-homework-photo-upload

# 5. Make initial commit linking to JIRA
git commit --allow-empty -m "feat(homework): start photo upload implementation

Starting work on homework photo evidence upload feature.
This will allow students to upload photos as proof of homework completion.

Part-of: CPG-200"

# 6. Begin development work...
```

### Example 2: Working on Multiple Related Issues

```bash
# Epic: CPG-300 "Student Dashboard Redesign"
# Sub-tasks: CPG-301, CPG-302, CPG-303

# Developer 1: Profile section
git checkout -b feature/CPG-301-profile-section-redesign

# Developer 2: Statistics widgets  
git checkout -b feature/CPG-302-statistics-widgets

# Developer 3: Navigation improvements
git checkout -b feature/CPG-303-navigation-improvements

# All work independently, merge to develop when ready
# Epic automatically tracks progress of all sub-tasks
```

### Example 3: Bug Fix During Development

```bash
# Found bug while working on CPG-200
# Create bug in JIRA: CPG-350 "File upload validation error"

# Create bugfix branch
git checkout develop
git checkout -b bugfix/CPG-350-file-upload-validation

# Fix bug with proper commit message
git commit -m "fix(upload): validate file types before processing

- Add MIME type validation for image uploads
- Prevent SVG files with embedded scripts
- Add unit tests for validation logic

Fixes CPG-350
Security-Impact: Medium"

# Create PR, get review, merge
# Continue with original feature work
```

## Team Collaboration Best Practices

### DO ✅
- **Always reference JIRA issues** in branch names and commits
- **Update JIRA status** as work progresses
- **Link PRs to JIRA issues** automatically
- **Use meaningful commit messages** with JIRA references
- **Keep feature branches small** and focused on single issues
- **Regularly sync with develop** to avoid conflicts
- **Review JIRA acceptance criteria** before marking work complete
- **Add time tracking** to JIRA issues for project planning

### DON'T ❌
- **Never create branches without JIRA references**
- **Don't work on unassigned issues** without coordination
- **Avoid mixing multiple JIRA issues** in single branch
- **Don't skip JIRA status updates** when changing code status
- **Never merge without PR review** and JIRA validation
- **Don't leave branches hanging** after merge completion
- **Avoid generic commit messages** without JIRA context
- **Don't modify closed/resolved issues** without reopening

## Troubleshooting and Common Issues

### Issue: Branch name validation fails
```bash
# Error: Branch name doesn't match required pattern
# Solution: Rename branch with proper JIRA reference

git branch -m feature/CPG-123-correct-name-format
```

### Issue: JIRA issue doesn't exist
```bash
# Error: CPG-999 not found in JIRA
# Solution: Create issue in JIRA first, then create branch

# Or reference existing issue:
git branch -m feature/CPG-200-existing-issue-name
```

### Issue: Multiple people working on same JIRA issue
```bash
# Solution: Create sub-tasks in JIRA for different aspects

# Original: CPG-400 "Implement user authentication"
# Sub-tasks: 
# - CPG-401 "OAuth integration"
# - CPG-402 "Password validation"
# - CPG-403 "Session management"

# Each developer takes a sub-task
git checkout -b feature/CPG-401-oauth-integration
git checkout -b feature/CPG-402-password-validation
```

### Issue: JIRA issue is blocked
```bash
# When JIRA issue is blocked, create spike for investigation
git checkout -b spike/CPG-500-investigate-database-performance

# After investigation, update original issue or create new approach
```

## Compliance and Security with JIRA Integration

### UK GDPR Requirements with JIRA Tracking
- **Data Migration Issues**: All database changes must have JIRA issues with data impact assessment
- **Personal Data Changes**: JIRA issues must include privacy impact assessment
- **Audit Trail**: Complete tracking from JIRA issue to production deployment
- **Data Retention**: JIRA issues track data lifecycle and retention requirements

### Educational Safeguarding with JIRA Oversight
- **Authentication Changes**: High-priority JIRA issues with security review required
- **User Role Modifications**: JIRA approval workflow for admin-level changes
- **Child Data Visibility**: Special JIRA issue type for child safety-related changes
- **Emergency Procedures**: Hotfix JIRA issues with immediate stakeholder notification

This comprehensive JIRA-integrated branching strategy ensures complete traceability, supports parallel development, maintains code quality, and provides the audit trail necessary for educational compliance while enabling efficient team collaboration.
EOF < /dev/null