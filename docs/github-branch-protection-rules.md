# GitHub Branch Protection Rules Configuration - Study Streaks

## Overview

This document provides the specific GitHub branch protection rules configuration for implementing the JIRA-integrated branching strategy. These rules ensure code quality, security compliance, and proper JIRA integration workflow.

## Branch Protection Configuration

### 1. Master Branch Protection (Production)

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "ci/build",
      "ci/test",
      "ci/lint",
      "ci/type-check",
      "ci/security-scan",
      "ci/accessibility-test",
      "ci/performance-test",
      "jira/issue-validation",
      "jira/issue-testing-complete",
      "jira/release-validation"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_review_from_codeowners": true,
    "bypass_pull_request_allowances": {
      "users": [],
      "teams": ["emergency-response"],
      "apps": []
    }
  },
  "restrictions": {
    "users": [],
    "teams": ["senior-developers", "tech-leads", "release-managers"],
    "apps": ["github-actions"]
  },
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
```

### 2. Develop Branch Protection (Staging)

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "ci/build",
      "ci/test",
      "ci/lint",
      "ci/type-check",
      "ci/security-scan",
      "ci/accessibility-test",
      "jira/issue-validation",
      "jira/branch-name-validation"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_review_from_codeowners": false
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
```

### 3. Release Branch Protection

```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "ci/build",
      "ci/test",
      "ci/lint",
      "ci/type-check",
      "ci/security-scan",
      "ci/accessibility-test",
      "ci/performance-test",
      "ci/e2e-test",
      "ci/migration-test",
      "jira/release-epic-validation",
      "jira/issue-completion-check"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_review_from_codeowners": true
  },
  "restrictions": {
    "users": [],
    "teams": ["release-managers", "tech-leads"],
    "apps": ["github-actions"]
  },
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
```

## GitHub Actions Configuration

### Branch Name Validation Workflow

Create `.github/workflows/jira-branch-validation.yml`:

```yaml
name: JIRA Branch Validation
on:
  pull_request:
    types: [opened, synchronize, edited]
  push:
    branches-ignore: [master, develop]

jobs:
  validate-branch-name:
    runs-on: ubuntu-latest
    steps:
      - name: Validate Branch Name Format
        run: |
          BRANCH_NAME="${{ github.head_ref || github.ref_name }}"
          echo "Validating branch: $BRANCH_NAME"
          
          # Allow master, develop, and release branches
          if [[ "$BRANCH_NAME" =~ ^(master|develop|release/.+)$ ]]; then
            echo "✅ Main branch - validation skipped"
            exit 0
          fi
          
          # Validate feature/bugfix/hotfix/etc branches
          PATTERN="^(feature|bugfix|hotfix|docs|chore|test|spike|refactor|performance)/CPG-[0-9]+-[a-z0-9-]+$"
          
          if [[ \! "$BRANCH_NAME" =~ $PATTERN ]]; then
            echo "❌ Invalid branch name: $BRANCH_NAME"
            echo "✅ Required format: <type>/CPG-<number>-<description>"
            echo "📋 Valid types: feature, bugfix, hotfix, docs, chore, test, spike, refactor, performance"
            echo "📋 Example: feature/CPG-123-user-dashboard-redesign"
            exit 1
          fi
          
          echo "✅ Branch name format is valid"

      - name: Extract JIRA Issue ID
        id: jira
        run: |
          BRANCH_NAME="${{ github.head_ref || github.ref_name }}"
          ISSUE_ID=$(echo "$BRANCH_NAME" | grep -oE 'CPG-[0-9]+' || echo "")
          
          if [[ -z "$ISSUE_ID" ]]; then
            echo "❌ No JIRA issue ID found in branch name"
            exit 1
          fi
          
          echo "issue_id=$ISSUE_ID" >> $GITHUB_OUTPUT
          echo "✅ Found JIRA issue: $ISSUE_ID"

      - name: Validate JIRA Issue Exists
        env:
          JIRA_URL: ${{ secrets.JIRA_URL }}
          JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
        run: |
          ISSUE_ID="${{ steps.jira.outputs.issue_id }}"
          
          # Check if JIRA issue exists
          RESPONSE=$(curl -s -w "%{http_code}" \
            -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
            -H "Accept: application/json" \
            "$JIRA_URL/rest/api/2/issue/$ISSUE_ID" \
            -o /tmp/jira_response.json)
          
          HTTP_CODE="${RESPONSE: -3}"
          
          if [[ "$HTTP_CODE" \!= "200" ]]; then
            echo "❌ JIRA issue $ISSUE_ID not found or not accessible"
            echo "Please ensure the issue exists and is accessible"
            exit 1
          fi
          
          # Check issue status
          STATUS=$(jq -r '.fields.status.name' /tmp/jira_response.json)
          ASSIGNEE=$(jq -r '.fields.assignee.emailAddress // "unassigned"' /tmp/jira_response.json)
          
          echo "✅ JIRA issue $ISSUE_ID found"
          echo "📋 Status: $STATUS"
          echo "👤 Assignee: $ASSIGNEE"
          
          # Validate status allows development
          VALID_STATUSES=("To Do" "In Progress" "Code Review")
          if [[ \! " ${VALID_STATUSES[@]} " =~ " ${STATUS} " ]]; then
            echo "⚠️  Warning: Issue status '$STATUS' may not be appropriate for active development"
            echo "✅ Valid statuses: ${VALID_STATUSES[*]}"
          fi
```

### PR Title Auto-Generation Workflow

Create `.github/workflows/jira-pr-title.yml`:

```yaml
name: JIRA PR Title Generation
on:
  pull_request:
    types: [opened]

jobs:
  update-pr-title:
    runs-on: ubuntu-latest
    if: github.event.action == 'opened'
    steps:
      - name: Extract JIRA Issue ID
        id: jira
        run: |
          BRANCH_NAME="${{ github.head_ref }}"
          ISSUE_ID=$(echo "$BRANCH_NAME" | grep -oE 'CPG-[0-9]+' || echo "")
          
          if [[ -z "$ISSUE_ID" ]]; then
            echo "No JIRA issue found - skipping title update"
            exit 0
          fi
          
          echo "issue_id=$ISSUE_ID" >> $GITHUB_OUTPUT

      - name: Get JIRA Issue Details
        id: jira_details
        if: steps.jira.outputs.issue_id
        env:
          JIRA_URL: ${{ secrets.JIRA_URL }}
          JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
        run: |
          ISSUE_ID="${{ steps.jira.outputs.issue_id }}"
          
          # Fetch issue details
          curl -s -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
            -H "Accept: application/json" \
            "$JIRA_URL/rest/api/2/issue/$ISSUE_ID" \
            -o /tmp/jira_issue.json
          
          SUMMARY=$(jq -r '.fields.summary' /tmp/jira_issue.json)
          ISSUE_TYPE=$(jq -r '.fields.issuetype.name' /tmp/jira_issue.json)
          PRIORITY=$(jq -r '.fields.priority.name' /tmp/jira_issue.json)
          
          echo "summary=$SUMMARY" >> $GITHUB_OUTPUT
          echo "issue_type=$ISSUE_TYPE" >> $GITHUB_OUTPUT
          echo "priority=$PRIORITY" >> $GITHUB_OUTPUT

      - name: Update PR Title and Description
        if: steps.jira.outputs.issue_id
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          ISSUE_ID="${{ steps.jira.outputs.issue_id }}"
          SUMMARY="${{ steps.jira_details.outputs.summary }}"
          ISSUE_TYPE="${{ steps.jira_details.outputs.issue_type }}"
          PRIORITY="${{ steps.jira_details.outputs.priority }}"
          
          # Generate new PR title
          NEW_TITLE="$ISSUE_ID: $SUMMARY"
          
          # Generate PR description
          PR_BODY=$(cat << EOF
          ## JIRA Issue
          **Issue**: [$ISSUE_ID: $SUMMARY](${{ secrets.JIRA_URL }}/browse/$ISSUE_ID)
          **Issue Type**: $ISSUE_TYPE
          **Priority**: $PRIORITY
          **Assignee**: @${{ github.actor }}
          
          ## Summary
          Brief description of changes made to resolve the JIRA issue.
          
          ## Changes Made
          - [ ] Feature/fix implemented
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
          
          ---
          **Auto-generated from JIRA issue $ISSUE_ID**
          EOF
          )
          
          # Update PR title and description
          gh pr edit ${{ github.event.pull_request.number }} \
            --title "$NEW_TITLE" \
            --body "$PR_BODY"
```

### JIRA Status Sync Workflow

Create `.github/workflows/jira-status-sync.yml`:

```yaml
name: JIRA Status Sync
on:
  pull_request:
    types: [opened, closed, merged]
  push:
    branches: [develop, master]

jobs:
  sync-jira-status:
    runs-on: ubuntu-latest
    steps:
      - name: Extract JIRA Issue ID
        id: jira
        run: |
          if [[ "${{ github.event_name }}" == "pull_request" ]]; then
            BRANCH_NAME="${{ github.head_ref }}"
          else
            BRANCH_NAME="${{ github.ref_name }}"
          fi
          
          ISSUE_ID=$(echo "$BRANCH_NAME" | grep -oE 'CPG-[0-9]+' || echo "")
          
          if [[ -z "$ISSUE_ID" ]]; then
            echo "No JIRA issue found - skipping status sync"
            exit 0
          fi
          
          echo "issue_id=$ISSUE_ID" >> $GITHUB_OUTPUT

      - name: Update JIRA Issue Status
        if: steps.jira.outputs.issue_id
        env:
          JIRA_URL: ${{ secrets.JIRA_URL }}
          JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
        run: |
          ISSUE_ID="${{ steps.jira.outputs.issue_id }}"
          
          # Determine target status based on event
          if [[ "${{ github.event_name }}" == "pull_request" ]]; then
            if [[ "${{ github.event.action }}" == "opened" ]]; then
              TARGET_STATUS="Code Review"
              COMMENT="PR opened: ${{ github.event.pull_request.html_url }}"
            elif [[ "${{ github.event.action }}" == "closed" && "${{ github.event.pull_request.merged }}" == "true" ]]; then
              if [[ "${{ github.event.pull_request.base.ref }}" == "develop" ]]; then
                TARGET_STATUS="Testing"
                COMMENT="Merged to develop for testing: ${{ github.event.pull_request.html_url }}"
              elif [[ "${{ github.event.pull_request.base.ref }}" == "master" ]]; then
                TARGET_STATUS="Done"
                COMMENT="Deployed to production: ${{ github.event.pull_request.html_url }}"
              fi
            fi
          fi
          
          if [[ -n "$TARGET_STATUS" ]]; then
            echo "Updating $ISSUE_ID to status: $TARGET_STATUS"
            
            # Add comment to JIRA issue
            curl -s -X POST \
              -u "$JIRA_EMAIL:$JIRA_API_TOKEN" \
              -H "Content-Type: application/json" \
              -d "{\"body\": \"$COMMENT\"}" \
              "$JIRA_URL/rest/api/2/issue/$ISSUE_ID/comment"
            
            # Note: Status transitions require workflow-specific transition IDs
            # This would need to be configured based on your JIRA workflow
            echo "✅ Added comment to JIRA issue $ISSUE_ID"
          fi
```

## Required Secrets Configuration

Add these secrets to your GitHub repository settings:

```bash
# JIRA Integration Secrets
JIRA_URL=https://studystreaks.atlassian.net
JIRA_EMAIL=your-jira-email@domain.com
JIRA_API_TOKEN=your-jira-api-token

# Additional secrets for enhanced functionality
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...  # For notifications
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...  # For Teams notifications
```

## Implementation Steps

### 1. Configure Branch Protection Rules

Use GitHub CLI to apply branch protection rules:

```bash
# Apply master branch protection
gh api repos/:owner/:repo/branches/master/protection \
  --method PUT \
  --input master-protection.json

# Apply develop branch protection  
gh api repos/:owner/:repo/branches/develop/protection \
  --method PUT \
  --input develop-protection.json

# Apply release branch protection pattern
gh api repos/:owner/:repo/branches/release%2F*/protection \
  --method PUT \
  --input release-protection.json
```

### 2. Set Up Required Status Checks

Configure required CI/CD checks:

```bash
# Example CI workflow contexts that must pass
REQUIRED_CHECKS=(
  "ci/build"
  "ci/test" 
  "ci/lint"
  "ci/type-check"
  "ci/security-scan"
  "ci/accessibility-test"
  "jira/issue-validation"
  "jira/branch-name-validation"
)
```

### 3. Configure CODEOWNERS File

Create `.github/CODEOWNERS`:

```bash
# Global code owners
* @tech-leads @senior-developers

# Authentication and security
/apps/*/auth/ @security-team @tech-leads
/packages/auth/ @security-team @tech-leads

# Database and migrations
/packages/database/ @database-team @tech-leads
*.sql @database-team @tech-leads

# Infrastructure and deployment
/infrastructure/ @devops-team @tech-leads
/.github/workflows/ @devops-team @tech-leads

# Documentation requiring review
/docs/ @tech-leads @product-team
README.md @tech-leads @product-team

# Critical configuration files
package.json @tech-leads
nx.json @tech-leads
tsconfig*.json @tech-leads
```

### 4. Configure Rulesets (GitHub's New Feature)

Use GitHub's repository rulesets for enhanced protection:

```json
{
  "name": "StudyStreaks Main Branch Protection",
  "target": "branch",
  "source_type": "Repository",
  "source": "study-streaks/study-streaks",
  "enforcement": "active",
  "conditions": {
    "ref_name": {
      "include": ["refs/heads/master", "refs/heads/develop"],
      "exclude": []
    }
  },
  "rules": [
    {
      "type": "deletion"
    },
    {
      "type": "non_fast_forward"
    },
    {
      "type": "required_linear_history"
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          {
            "context": "ci/build",
            "integration_id": null
          },
          {
            "context": "jira/issue-validation", 
            "integration_id": null
          }
        ]
      }
    },
    {
      "type": "pull_request",
      "parameters": {
        "dismiss_stale_reviews_on_push": true,
        "require_code_owner_review": true,
        "require_last_push_approval": false,
        "required_approving_review_count": 2,
        "required_review_thread_resolution": true
      }
    }
  ],
  "bypass_actors": [
    {
      "actor_id": 1,
      "actor_type": "Team",
      "bypass_mode": "always"
    }
  ]
}
```

## Monitoring and Compliance

### Branch Protection Compliance Check

Create a monthly compliance report:

```bash
#\!/bin/bash
# scripts/check-branch-protection-compliance.sh

echo "🛡️  StudyStreaks Branch Protection Compliance Report"
echo "Generated: $(date)"
echo "================================================"

# Check master branch protection
echo "📋 Master Branch Protection:"
gh api repos/:owner/:repo/branches/master/protection \
  --jq '.required_status_checks.contexts[]' | while read check; do
  echo "  ✅ $check"
done

# Check for unprotected branches
echo "📋 Unprotected Branches:"
gh api repos/:owner/:repo/branches \
  --jq '.[] | select(.protected == false) | .name' | while read branch; do
  echo "  ⚠️  $branch"
done

# Check for branches not following naming convention
echo "📋 Non-compliant Branch Names:"
gh api repos/:owner/:repo/branches \
  --jq '.[] | .name' | grep -vE '^(master|develop|release/|feature/CPG-|bugfix/CPG-|hotfix/CPG-)' | while read branch; do
  echo "  ❌ $branch"
done
```

### JIRA Integration Health Check

```bash
#\!/bin/bash
# scripts/check-jira-integration-health.sh

echo "🔗 JIRA Integration Health Check"
echo "Generated: $(date)"
echo "================================"

# Check recent PRs for JIRA references
echo "📋 Recent PRs without JIRA references:"
gh pr list --state merged --limit 20 --json title,number | \
  jq -r '.[] | select(.title | test("CPG-[0-9]+") | not) | "PR #\(.number): \(.title)"'

# Check for active branches without JIRA references
echo "📋 Active branches without JIRA references:"
gh api repos/:owner/:repo/branches \
  --jq '.[] | select(.name | test("^(feature|bugfix|hotfix)/CPG-[0-9]+") | not) | select(.name | test("^(master|develop)$") | not) | .name'
```

This comprehensive branch protection configuration ensures your JIRA-integrated branching strategy is properly enforced at the GitHub repository level, maintaining code quality and compliance with your educational platform requirements.
EOF < /dev/null