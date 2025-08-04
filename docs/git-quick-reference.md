# Git Quick Reference - Study Streaks

## Daily Commands

### Starting New Work
```bash
# Start a new feature
git checkout develop
git pull origin develop
git checkout -b feature/CPG-123-user-dashboard

# Start a bugfix
git checkout develop
git pull origin develop
git checkout -b bugfix/CPG-124-login-error
```

### Making Changes
```bash
# Stage and commit changes
git add .
git commit -m "feat(auth): add user dashboard layout"

# Push branch (first time)
git push -u origin feature/CPG-123-user-dashboard

# Push subsequent changes
git push
```

### Keeping Up to Date
```bash
# Update your feature branch with latest develop
git checkout develop
git pull origin develop
git checkout feature/CPG-123-user-dashboard
git rebase develop
```

## Commit Message Examples

### Good Examples ✅
```
feat(homework): add photo evidence upload
fix(streaks): correct weekend calculation logic
docs(api): update authentication endpoints
test(compliance): add GDPR deletion tests
chore(deps): update security dependencies to latest
refactor(ui): simplify dashboard component structure
perf(db): optimize streak calculation query
```

### Bad Examples ❌
```
fix stuff
updated files
working on feature
temp commit
asdfgh
Fixed bug
Add new things
```

## Branch Naming Examples

### Good Examples ✅
```
feature/CPG-123-homework-upload-system
bugfix/CPG-124-streak-calculation-error
hotfix/CPG-125-gdpr-data-deletion
release/v2.1.0
docs/CPG-126-api-documentation
chore/CPG-127-dependency-updates
test/CPG-128-e2e-authentication
```

### Bad Examples ❌
```
my-feature
fix-bug
new-stuff
user-dashboard
temp-branch
test123
```

## Common Workflows

### Creating a Pull Request
1. Push your feature branch
2. Go to GitHub and create PR to `develop`
3. Fill out PR template with:
   - Description of changes
   - Testing steps
   - Screenshots (if UI changes)
   - Issue references
4. Request reviews from relevant team members
5. Address feedback and push updates
6. Merge when approved and CI passes

### Fixing a Critical Bug (Hotfix)
```bash
# Create hotfix from master
git checkout master
git pull origin master
git checkout -b hotfix/CPG-125-security-patch

# Make the fix
git add .
git commit -m "fix(security): patch user data exposure"

# Create PR to master (fast-track review)
git push -u origin hotfix/CPG-125-security-patch

# After merge, update develop
git checkout develop
git pull origin develop
git merge master
git push origin develop
```

### Preparing a Release
```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Update version numbers, changelog
npm version 1.2.0
git add .
git commit -m "chore(release): bump version to 1.2.0"

# Create PR to master for release
git push -u origin release/v1.2.0

# After merge to master, tag the release
git checkout master
git pull origin master
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

## Useful Git Commands

### Status and Information
```bash
# Check current status
git status

# View branch structure
git log --oneline --graph --all

# See what files changed
git diff --name-only

# Check remote branches
git branch -rv
```

### Cleaning Up
```bash
# Clean up merged branches locally
npm run git:cleanup

# Dry run cleanup (see what would be deleted)
npm run git:cleanup:dry

# Manual cleanup
git branch --merged develop | grep -v develop | xargs git branch -d
```

### Undoing Changes
```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo changes in working directory
git checkout -- .

# Undo specific file
git checkout -- filename.js

# Reset to specific commit
git reset --hard abc123
```

## Emergency Commands

### Fix Wrong Branch
```bash
# If you committed to wrong branch
git reset --soft HEAD~1  # Undo commit, keep changes
git stash                # Stash changes
git checkout correct-branch
git stash pop           # Apply changes to correct branch
```

### Fix Wrong Commit Message
```bash
# Fix last commit message
git commit --amend -m "corrected message"

# Fix commit message in pushed branch (be careful!)
git commit --amend -m "corrected message"
git push --force-with-lease
```

### Remove Sensitive Data
```bash
# Remove file from last commit
git rm --cached sensitive-file.txt
git commit --amend --no-edit

# Remove from history (use carefully!)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch sensitive-file.txt' \
  --prune-empty --tag-name-filter cat -- --all
```

## Git Hooks

The repository has pre-configured hooks that will:

- **commit-msg**: Validate commit message format
- **pre-push**: Validate branch names and run tests
- **pre-commit**: Run linting and formatting (via lint-staged)

### Bypassing Hooks (Emergency Only)
```bash
# Skip commit message validation
git commit --no-verify -m "emergency fix"

# Skip pre-push checks
git push --no-verify
```

## Troubleshooting

### Common Issues

**Merge Conflicts**
```bash
# View conflicted files
git status

# Edit files to resolve conflicts
# Look for <<<<<<< ======= >>>>>>> markers

# Mark as resolved
git add conflicted-file.js

# Complete merge
git commit
```

**Pushed to Wrong Branch**
```bash
# Reset branch to previous state
git reset --hard HEAD~1
git push --force-with-lease
```

**Need to Update PR Branch**
```bash
git checkout develop
git pull origin develop
git checkout your-feature-branch
git rebase develop
git push --force-with-lease
```

### Getting Help
```bash
# Git help
git help <command>

# Show git log with branches
git log --oneline --graph --all --decorate

# Show what changed in commit
git show <commit-hash>
```

## Team Guidelines

### Before Starting Work
- [ ] Pull latest `develop`
- [ ] Create appropriately named branch
- [ ] Check Jira ticket for requirements

### Before Committing
- [ ] Run tests locally
- [ ] Follow commit message convention
- [ ] Keep commits focused and atomic

### Before Creating PR
- [ ] Rebase on latest `develop`
- [ ] Squash related commits if needed
- [ ] Test thoroughly
- [ ] Update documentation if needed

### Before Merging
- [ ] Get required approvals
- [ ] Ensure CI passes
- [ ] Check for conflicts
- [ ] Verify deployment will work

Remember: When in doubt, ask for help! The git hooks will catch many issues, but good practices prevent problems before they start.