#!/bin/bash

# Git Branch Cleanup Script for Study Streaks
# Safely removes merged branches and provides cleanup options

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROTECTED_BRANCHES=("master" "develop")
DRY_RUN=false
INTERACTIVE=true
FORCE=false

# Functions
print_header() {
    echo -e "${BLUE}=== Study Streaks Git Cleanup ===${NC}"
    echo ""
}

print_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --dry-run     Show what would be deleted without actually deleting"
    echo "  -f, --force       Delete without confirmation"
    echo "  -y, --yes         Non-interactive mode, assume yes to all prompts"
    echo "  -h, --help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                 # Interactive cleanup"
    echo "  $0 --dry-run       # Show what would be cleaned up"
    echo "  $0 --force --yes   # Clean up everything automatically"
}

confirm() {
    if [[ "$FORCE" == true ]] || [[ "$INTERACTIVE" == false ]]; then
        return 0
    fi
    
    local message="$1"
    echo -e "${YELLOW}$message (y/N):${NC} "
    read -r response
    case "$response" in
        [yY][eE][sS]|[yY]) return 0 ;;
        *) return 1 ;;
    esac
}

is_protected_branch() {
    local branch="$1"
    for protected in "${PROTECTED_BRANCHES[@]}"; do
        if [[ "$branch" == "$protected" ]]; then
            return 0
        fi
    done
    return 1
}

get_merged_branches() {
    local target_branch="$1"
    git branch --merged "$target_branch" | grep -v "^\*" | grep -v "$target_branch" | sed 's/^[[:space:]]*//'
}

get_remote_merged_branches() {
    local target_branch="$1"
    git branch -r --merged "$target_branch" | grep -v "origin/$target_branch" | grep -v "origin/HEAD" | sed 's/^[[:space:]]*//' | sed 's/origin\///'
}

cleanup_local_branches() {
    echo -e "${BLUE}Checking for merged local branches...${NC}"
    
    local merged_branches
    merged_branches=$(get_merged_branches "develop")
    
    if [[ -z "$merged_branches" ]]; then
        echo -e "${GREEN}No merged local branches found.${NC}"
        return
    fi
    
    echo -e "${YELLOW}Found merged local branches:${NC}"
    echo "$merged_branches"
    echo ""
    
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would delete these local branches${NC}"
        return
    fi
    
    if confirm "Delete these merged local branches?"; then
        while IFS= read -r branch; do
            if [[ -n "$branch" ]] && ! is_protected_branch "$branch"; then
                echo -e "${GREEN}Deleting local branch: $branch${NC}"
                git branch -d "$branch"
            fi
        done <<< "$merged_branches"
    fi
}

cleanup_remote_tracking_branches() {
    echo -e "${BLUE}Checking for stale remote tracking branches...${NC}"
    
    # Prune remote tracking branches
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would prune stale remote tracking branches${NC}"
        git remote prune origin --dry-run
    else
        if confirm "Prune stale remote tracking branches?"; then
            echo -e "${GREEN}Pruning stale remote tracking branches...${NC}"
            git remote prune origin
        fi
    fi
}

cleanup_old_feature_branches() {
    echo -e "${BLUE}Checking for old feature branches (>30 days)...${NC}"
    
    local old_branches
    old_branches=$(git for-each-ref --format='%(refname:short) %(committerdate)' refs/heads/ | 
                   awk '$2 < "'$(date -d '30 days ago' '+%Y-%m-%d')'"' | 
                   awk '{print $1}' | 
                   grep -E '^(feature|bugfix)/' || true)
    
    if [[ -z "$old_branches" ]]; then
        echo -e "${GREEN}No old feature branches found.${NC}"
        return
    fi
    
    echo -e "${YELLOW}Found old feature branches (>30 days):${NC}"
    echo "$old_branches"
    echo ""
    
    if [[ "$DRY_RUN" == true ]]; then
        echo -e "${BLUE}[DRY RUN] Would suggest reviewing these old branches${NC}"
        return
    fi
    
    echo -e "${YELLOW}Consider reviewing these branches manually.${NC}"
    echo -e "${YELLOW}Use 'git branch -D <branch>' to force delete if no longer needed.${NC}"
}

show_branch_status() {
    echo -e "${BLUE}Current branch status:${NC}"
    echo ""
    
    echo -e "${GREEN}Local branches:${NC}"
    git branch -v
    echo ""
    
    echo -e "${GREEN}Remote branches:${NC}"
    git branch -rv
    echo ""
    
    echo -e "${GREEN}Recent commits:${NC}"
    git log --oneline -10
    echo ""
}

main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -f|--force)
                FORCE=true
                shift
                ;;
            -y|--yes)
                INTERACTIVE=false
                shift
                ;;
            -h|--help)
                print_usage
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                print_usage
                exit 1
                ;;
        esac
    done
    
    print_header
    
    # Ensure we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}Error: Not in a git repository${NC}"
        exit 1
    fi
    
    # Fetch latest changes
    echo -e "${BLUE}Fetching latest changes...${NC}"
    git fetch --all --prune
    echo ""
    
    # Show current status
    show_branch_status
    
    # Perform cleanup operations
    cleanup_local_branches
    echo ""
    
    cleanup_remote_tracking_branches
    echo ""
    
    cleanup_old_feature_branches
    echo ""
    
    echo -e "${GREEN}Cleanup complete!${NC}"
}

# Run main function
main "$@"