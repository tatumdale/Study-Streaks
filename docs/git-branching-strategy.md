# Git Branching Strategy - Study Streaks

## Overview

Study Streaks uses a **simplified Git Flow** strategy optimized for educational compliance, continuous integration, and safe deployment to production environments handling children's data.

## Branch Structure

### Main Branches

#### `master` (Production)
- **Purpose**: Production-ready code deployed to live environment
- **Protection**: Heavily protected, requires PR reviews and CI/CD checks
- **Deployment**: Automatically deploys to production
- **Naming**: `master`
- **Lifetime**: Permanent

#### `develop` (Development Integration)
- **Purpose**: Integration branch for all development work
- **Protection**: Moderate protection, requires CI checks
- **Deployment**: Automatically deploys to staging environment
- **Naming**: `develop`
- **Lifetime**: Permanent

### Supporting Branches

#### Feature Branches
- **Purpose**: Development of new features or enhancements
- **Base**: `develop`
- **Merge Target**: `develop` via Pull Request
- **Naming Convention**: `feature/SSP-123-user-authentication`
- **Lifetime**: Temporary (deleted after merge)

#### Bugfix Branches
- **Purpose**: Non-critical bug fixes during development
- **Base**: `develop`
- **Merge Target**: `develop` via Pull Request
- **Naming Convention**: `bugfix/SSP-124-login-validation`
- **Lifetime**: Temporary (deleted after merge)

#### Hotfix Branches
- **Purpose**: Critical production fixes that cannot wait for next release
- **Base**: `master`
- **Merge Target**: Both `master` and `develop`
- **Naming Convention**: `hotfix/SSP-125-security-patch`
- **Lifetime**: Temporary (deleted after merge)

#### Release Branches
- **Purpose**: Prepare releases, minor bug fixes, and metadata updates
- **Base**: `develop`
- **Merge Target**: Both `master` and `develop`
- **Naming Convention**: `release/v1.2.0`
- **Lifetime**: Temporary (deleted after merge)

## Branch Naming Conventions

### Format
```
<type>/<ticket-id>-<short-description>
```

### Types
- `feature/` - New functionality
- `bugfix/` - Bug fixes (non-critical)
- `hotfix/` - Critical production fixes
- `release/` - Release preparation
- `docs/` - Documentation updates
- `chore/` - Maintenance tasks
- `test/` - Test improvements

### Examples
```
feature/SSP-123-homework-upload-system
bugfix/SSP-124-streak-calculation-error
hotfix/SSP-125-gdpr-data-deletion
release/v2.1.0
docs/SSP-126-api-documentation
chore/SSP-127-dependency-updates
test/SSP-128-e2e-authentication
```

## Workflow

### 1. Feature Development
```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/SSP-123-user-dashboard

# Work on feature
git add .
git commit -m "feat: add user dashboard layout"

# Push and create PR
git push origin feature/SSP-123-user-dashboard
```

### 2. Release Process
```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Update version numbers, CHANGELOG
# Minor bug fixes only

# Merge to master
git checkout master
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"

# Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0

# Delete release branch
git branch -d release/v1.2.0
```

### 3. Hotfix Process
```bash
# Create hotfix from master
git checkout master
git pull origin master
git checkout -b hotfix/SSP-125-security-patch

# Fix critical issue
git add .
git commit -m "fix: patch security vulnerability"

# Merge to master
git checkout master
git merge --no-ff hotfix/SSP-125-security-patch
git tag -a v1.2.1 -m "Hotfix v1.2.1"

# Merge to develop
git checkout develop
git merge --no-ff hotfix/SSP-125-security-patch

# Delete hotfix branch
git branch -d hotfix/SSP-125-security-patch
```

## Commit Message Convention

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

### Scopes (Educational Context)
- `auth`: Authentication/authorization
- `homework`: Homework tracking
- `streaks`: Streak calculation
- `gamification`: Points, badges, rewards
- `clubs`: Learning clubs
- `admin`: Admin interface
- `api`: Backend API
- `ui`: User interface
- `db`: Database changes
- `compliance`: GDPR/privacy features

### Examples
```
feat(homework): add photo evidence upload
fix(streaks): correct calculation for weekend gaps
docs(api): update authentication endpoints
test(compliance): add GDPR data deletion tests
chore(deps): update security dependencies
```

## Branch Protection Rules

### Master Branch
- Require pull request reviews before merging
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Restrict pushes that create files in sensitive paths
- Require linear history

### Develop Branch
- Require status checks to pass before merging
- Require branches to be up to date before merging

## Automated Checks

### All Pull Requests
- [ ] Linting (ESLint, Prettier)
- [ ] Type checking (TypeScript)
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Security scan (Snyk/CodeQL)
- [ ] Accessibility tests (axe-core)
- [ ] GDPR compliance checks

### Release/Hotfix Additional Checks
- [ ] E2E tests pass
- [ ] Performance regression tests
- [ ] Database migration tests
- [ ] Documentation updated

## Environment Mapping

```
master     → Production    (studystreaks.co.uk)
develop    → Staging       (staging.studystreaks.co.uk)
feature/*  → Preview       (pr-123.studystreaks.dev)
```

## Best Practices

### DO
✅ Use descriptive branch names with ticket IDs
✅ Keep commits small and focused
✅ Write clear commit messages
✅ Rebase feature branches before merging
✅ Delete merged branches
✅ Tag releases with semantic versioning
✅ Test thoroughly before merging to develop

### DON'T
❌ Commit directly to master or develop
❌ Use generic commit messages ("fix stuff")
❌ Leave branches hanging after merge
❌ Mix unrelated changes in one commit
❌ Force push to shared branches
❌ Skip CI checks for "minor" changes

## Emergency Procedures

### Critical Production Issue
1. Create hotfix branch from master
2. Apply minimal fix
3. Deploy to staging for verification
4. Fast-track review process (single reviewer)
5. Deploy to production
6. Create post-mortem issue

### Rollback Procedure
```bash
# Rollback to previous version
git checkout master
git revert HEAD
git push origin master

# Or rollback to specific version
git reset --hard v1.1.0
git push --force-with-lease origin master
```

## Tools Integration

### Required Tools
- **GitHub/GitLab**: Repository hosting with PR/MR workflows
- **Husky**: Git hooks for commit message validation
- **Conventional Commits**: Standardized commit format
- **Semantic Release**: Automated versioning and changelog

### Optional Tools
- **GitKraken/SourceTree**: Visual Git client
- **GitHub CLI**: Command-line GitHub integration
- **Git Flow**: Command-line Git Flow extension

## Compliance Considerations

### UK GDPR Requirements
- All database migrations must be reviewed
- Personal data changes require additional approval
- Audit trail maintained for all production changes
- Data retention policy changes require legal review

### Educational Safeguarding
- Changes to authentication require extra scrutiny
- User role modifications need admin approval
- Any changes affecting child data visibility require review

This branching strategy ensures code quality, deployment safety, and compliance with UK educational data protection requirements while maintaining development velocity.