# Developer Workflow Guide - JIRA Integrated Git Strategy

## Quick Start Checklist

### Before You Start Development

1. **Check JIRA Assignment**
   ```bash
   # Visit JIRA and ensure issue is assigned to you
   # https://studystreaks.atlassian.net/browse/CPG-XXX
   ```

2. **Update Local Repository**
   ```bash
   git checkout develop
   git pull origin develop
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/CPG-XXX-short-description
   ```

4. **Move JIRA Issue to "In Progress"**
   - Update status in JIRA UI
   - Add time tracking estimate if required

## Daily Development Workflow

### Starting Work on a JIRA Issue

```bash
# Example: Working on CPG-245 "Add homework reminder notifications"

# 1. Check out develop and pull latest changes
git checkout develop
git pull origin develop

# 2. Create feature branch with proper naming
git checkout -b feature/CPG-245-homework-reminder-notifications

# 3. Make initial commit (optional but recommended)
git commit --allow-empty -m "feat(notifications): start homework reminder implementation

Starting work on homework reminder notification system.
Will implement email and push notifications for overdue homework.

Part-of: CPG-245"

# 4. Push branch to establish remote tracking
git push -u origin feature/CPG-245-homework-reminder-notifications
```

### Making Commits with JIRA Integration

```bash
# Small, focused commits with proper JIRA references

# Example 1: Feature development
git add src/services/notification-service.ts
git commit -m "feat(notifications): implement email notification service

- Add email template for homework reminders
- Implement scheduling logic for daily reminders
- Add configuration for email frequency

Part-of: CPG-245"

# Example 2: Bug fix during feature work
git add src/utils/date-helpers.ts
git commit -m "fix(notifications): correct timezone handling in reminder scheduling

The previous implementation didn't account for user timezone preferences
when scheduling reminder notifications.

- Add timezone conversion utilities
- Update reminder scheduling to use user's local timezone
- Add unit tests for timezone edge cases

Fixes: CPG-246
Part-of: CPG-245"

# Example 3: Final implementation
git add .
git commit -m "feat(notifications): complete homework reminder notification system

- Implement push notification service
- Add user preference management for notification types
- Create admin interface for notification templates
- Add comprehensive test coverage

Closes: CPG-245
Testing: Manual verification with test users"
```

### Creating Pull Requests

```bash
# 1. Push final changes
git push origin feature/CPG-245-homework-reminder-notifications

# 2. Create PR using GitHub CLI (recommended)
gh pr create \
  --title "CPG-245: Add homework reminder notifications" \
  --body "## JIRA Issue
**Issue**: [CPG-245: Add homework reminder notifications](https://studystreaks.atlassian.net/browse/CPG-245)
**Issue Type**: Story
**Priority**: Medium
**Assignee**: @your-username

## Summary
Implements a comprehensive homework reminder notification system that sends email and push notifications to students for overdue homework assignments.

## Changes Made
- [x] Email notification service implemented
- [x] Push notification service implemented  
- [x] User preference management added
- [x] Admin interface for notification templates
- [x] Comprehensive test coverage added

## Testing
- [x] Unit tests pass (45 new tests added)
- [x] Integration tests pass
- [x] Manual testing completed with test users
- [x] All acceptance criteria verified

## JIRA Issue Checklist
- [x] All acceptance criteria met
- [x] Issue ready for QA/Testing
- [x] Documentation updated in API docs
- [x] Security considerations reviewed (email content sanitization)

## Screenshots
\![Notification Settings](./screenshots/notification-settings.png)
\![Email Template](./screenshots/email-template.png)

---
**Auto-generated from JIRA issue CPG-245**" \
  --assignee @your-username \
  --reviewer @tech-lead \
  --label "enhancement,jira-linked"

# 3. Alternatively, create PR through GitHub web interface
# Title will be auto-generated: "CPG-245: Add homework reminder notifications"
```

## Common Development Scenarios

### Scenario 1: Working on Multiple Related Issues

```bash
# Epic: CPG-300 "Student Dashboard Redesign"
# Sub-tasks: CPG-301, CPG-302, CPG-303

# You're assigned CPG-301: "Redesign profile section"
git checkout develop
git pull origin develop
git checkout -b feature/CPG-301-profile-section-redesign

# Colleague working on CPG-302: "Update statistics widgets"
# Another colleague on CPG-303: "Improve navigation menu"

# All work in parallel, no conflicts
# Epic CPG-300 automatically tracks progress of all sub-tasks
```

### Scenario 2: Bug Found During Feature Development

```bash
# Currently working on feature/CPG-301-profile-section-redesign
# Discover a critical bug that needs immediate fix

# 1. Create bug issue in JIRA: CPG-350 "Profile image upload fails on iOS"
# 2. Commit current work in progress
git add .
git commit -m "wip: profile section layout improvements

Work in progress on profile section redesign.
Layout structure completed, styling in progress.

Part-of: CPG-301"

# 3. Switch to develop and create bugfix branch
git checkout develop
git pull origin develop
git checkout -b bugfix/CPG-350-profile-image-upload-ios-fix

# 4. Fix the bug
git add .
git commit -m "fix(profile): resolve image upload failure on iOS Safari

iOS Safari has specific MIME type validation requirements that
were causing profile image uploads to fail silently.

- Add iOS-specific MIME type detection
- Update upload validation logic
- Add mobile browser compatibility tests

Fixes: CPG-350
Testing: Verified on iOS Safari 15+ and Chrome iOS"

# 5. Create PR for bug fix
gh pr create --title "CPG-350: Fix profile image upload on iOS" --base develop

# 6. Return to feature work
git checkout feature/CPG-301-profile-section-redesign
git pull origin develop  # Get any updates
git rebase develop       # Rebase onto latest develop (optional)

# Continue feature work...
```

### Scenario 3: Hotfix for Production Issue

```bash
# Critical security issue discovered in production
# JIRA issue created: CPG-400 "Authentication bypass vulnerability" (Priority: Highest)

# 1. Create hotfix from master
git checkout master
git pull origin master
git checkout -b hotfix/CPG-400-auth-bypass-security-fix

# 2. Apply minimal fix
git add src/middleware/auth-middleware.ts
git commit -m "fix(security): patch authentication bypass vulnerability

Critical security fix for token validation bypass that could
allow unauthorized access to student data.

- Add additional token signature validation
- Implement stricter role-based access checks
- Add security headers for all authenticated routes

Critical fix for CPG-400
Security-Impact: High
GDPR-Impact: High - prevents unauthorized access to student data"

# 3. Create emergency PR
gh pr create \
  --title "🚨 HOTFIX CPG-400: Authentication bypass security fix" \
  --body "**EMERGENCY SECURITY HOTFIX**

JIRA: CPG-400
Priority: Highest
Security Impact: High

This hotfix addresses a critical authentication bypass vulnerability.

**Changes:**
- Patch token validation bypass
- Add stricter access controls  
- Implement additional security headers

**Testing:**
- Security team validation completed
- Penetration testing passed
- No regression in functionality

**Deployment:**
- Requires immediate production deployment
- Zero downtime deployment verified" \
  --base master \
  --assignee @security-team \
  --reviewer @tech-lead,@security-lead \
  --label "hotfix,security,urgent"

# 4. After merge to master, merge back to develop
git checkout develop
git pull origin develop
git merge --no-ff hotfix/CPG-400-auth-bypass-security-fix
git push origin develop

# 5. Clean up hotfix branch
git branch -d hotfix/CPG-400-auth-bypass-security-fix
git push origin --delete hotfix/CPG-400-auth-bypass-security-fix
```

### Scenario 4: Release Preparation

```bash
# Preparing release v2.3.0
# Create release epic in JIRA: CPG-500 "March 2024 Release v2.3.0"

# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v2.3.0-CPG-500-march-2024-release

# 2. Update version numbers
npm version minor  # Updates package.json to 2.3.0

# 3. Generate changelog from JIRA
npm run changelog:generate  # Custom script that queries JIRA API

# 4. Update documentation
git add CHANGELOG.md package.json docs/
git commit -m "release: prepare version 2.3.0

- Update version to 2.3.0
- Generate changelog from JIRA issues
- Update API documentation
- Update deployment guides

Release: CPG-500"

# 5. Only critical bug fixes allowed in release branch
# If critical bug found: create bugfix/CPG-501-release-critical-fix

# 6. Final merge to master
git checkout master
git merge --no-ff release/v2.3.0-CPG-500-march-2024-release
git tag -a v2.3.0 -m "Release v2.3.0 - March 2024

JIRA Epic: CPG-500
Features:
- Homework reminder notifications (CPG-245)
- Dashboard redesign (CPG-300)
- Performance improvements (CPG-450)

Bug Fixes:
- iOS upload issues (CPG-350)
- Streak calculation fixes (CPG-375)

Security:
- Authentication improvements (CPG-400)"

# 7. Merge back to develop and clean up
git checkout develop
git merge --no-ff release/v2.3.0-CPG-500-march-2024-release
git push origin develop master --tags
git branch -d release/v2.3.0-CPG-500-march-2024-release
```

## Advanced Git Commands for JIRA Integration

### Rebasing with JIRA Context

```bash
# Clean up commit history before creating PR
git rebase -i develop

# Example interactive rebase session:
# pick a1b2c3d feat(notifications): add email service
# squash d4e5f6g fix(notifications): typo in email template  
# pick g7h8i9j feat(notifications): add push notification service
# squash j0k1l2m style(notifications): format code
# pick m3n4o5p feat(notifications): add user preferences

# Result: Clean, logical commits that tell the story of your JIRA issue
```

### Cherry-picking Between Branches

```bash
# Need to apply a fix from one feature branch to another
git checkout feature/CPG-245-homework-notifications
git log --oneline  # Find commit hash: a1b2c3d

git checkout feature/CPG-246-student-alerts  
git cherry-pick a1b2c3d

# Update commit message to reference both issues
git commit --amend -m "fix(notifications): shared email validation utility

Cherry-picked from feature/CPG-245-homework-notifications.
This fix is needed for both notification systems.

Relates-to: CPG-245, CPG-246"
```

### Finding Commits by JIRA Issue

```bash
# Find all commits related to a JIRA issue
git log --grep="CPG-245" --oneline

# Find commits by author for specific issue
git log --author="your-name" --grep="CPG-245" --oneline

# Show detailed changes for JIRA issue
git log --grep="CPG-245" -p
```

## Troubleshooting Common Issues

### Issue: Branch name validation fails

```bash
# Error: Branch name doesn't match required pattern
❌ feature/user-dashboard

# Solution: Use proper JIRA reference
✅ git branch -m feature/CPG-123-user-dashboard-redesign
```

### Issue: JIRA issue doesn't exist

```bash
# Error: CPG-999 not found in JIRA
# Solution 1: Create the issue in JIRA first
# Solution 2: Use existing issue number
git branch -m feature/CPG-245-correct-existing-issue
```

### Issue: Merge conflicts with develop

```bash
# Update your feature branch with latest develop
git checkout feature/CPG-245-homework-notifications
git pull origin develop

# Resolve conflicts, then:
git add .
git commit -m "merge: resolve conflicts with develop

Conflicts resolved in notification service due to recent
changes in email configuration structure.

Part-of: CPG-245"
```

### Issue: Need to update JIRA reference in commits

```bash
# Fix commit message with wrong JIRA reference
git commit --amend -m "feat(notifications): implement email service

- Add email template system
- Configure SMTP settings
- Add retry logic for failed sends

Closes: CPG-245"  # Fixed from wrong CPG-999
```

### Issue: Accidentally committed to wrong branch

```bash
# Committed to develop instead of feature branch
git log --oneline -1  # Note the commit hash: a1b2c3d

# Undo the commit on develop
git reset --hard HEAD~1

# Switch to correct branch and apply commit
git checkout feature/CPG-245-homework-notifications
git cherry-pick a1b2c3d
```

## Git Hooks for JIRA Integration

### Pre-commit Hook

Create `.git/hooks/pre-commit`:

```bash
#\!/bin/bash
# Validate commit message format and JIRA references

COMMIT_MSG_FILE="$1"
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Check if commit message has JIRA reference
if \! echo "$COMMIT_MSG" | grep -qE "(Closes|Fixes|Part-of|Relates-to): CPG-[0-9]+"; then
    echo "❌ Commit message must include JIRA reference"
    echo "✅ Examples:"
    echo "   Closes: CPG-123"
    echo "   Fixes: CPG-124" 
    echo "   Part-of: CPG-125"
    echo "   Relates-to: CPG-126"
    exit 1
fi

echo "✅ Commit message format valid"
```

### Pre-push Hook

Create `.git/hooks/pre-push`:

```bash
#\!/bin/bash
# Validate branch name before pushing

BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Allow master, develop, and release branches
if [[ "$BRANCH" =~ ^(master|develop|release/.+)$ ]]; then
    exit 0
fi

# Validate feature branch naming
PATTERN="^(feature|bugfix|hotfix|docs|chore|test|spike|refactor|performance)/CPG-[0-9]+-[a-z0-9-]+$"

if [[ \! "$BRANCH" =~ $PATTERN ]]; then
    echo "❌ Invalid branch name: $BRANCH"
    echo "✅ Required format: <type>/CPG-<number>-<description>"
    echo "📋 Valid types: feature, bugfix, hotfix, docs, chore, test, spike, refactor, performance"
    exit 1
fi

echo "✅ Branch name format valid"
```

## Team Collaboration Tips

### Code Review Best Practices

1. **Review JIRA Issue First**
   - Understand acceptance criteria
   - Check issue status and assignments
   - Verify feature requirements

2. **Review PR Against JIRA Requirements**
   ```markdown
   ## Review Checklist
   - [ ] All JIRA acceptance criteria addressed
   - [ ] Code changes align with issue description
   - [ ] Tests cover the requirements
   - [ ] Documentation updated if needed
   - [ ] Security considerations reviewed
   ```

3. **JIRA-Aware Comments**
   ```markdown
   This implementation looks good, but I noticed the JIRA issue CPG-245 
   mentions push notifications, which I don't see implemented. 
   Should that be a separate issue?
   ```

### Handling Dependencies

```bash
# Your issue CPG-245 depends on CPG-244 being completed
# Check JIRA for status and create dependent branch

# Option 1: Wait for CPG-244 to be merged to develop
git checkout develop
git pull origin develop  # After CPG-244 is merged
git checkout -b feature/CPG-245-homework-notifications

# Option 2: Create branch from the dependency
git checkout feature/CPG-244-notification-infrastructure
git checkout -b feature/CPG-245-homework-notifications

# Note dependency in commit message
git commit -m "feat(notifications): start homework notifications

This work depends on notification infrastructure from CPG-244.
Will need to rebase once CPG-244 is merged to develop.

Depends-on: CPG-244
Part-of: CPG-245"
```

This comprehensive developer guide provides practical, real-world examples for working with the JIRA-integrated Git branching strategy in your daily development workflow.
EOF < /dev/null