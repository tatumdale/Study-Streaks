# Git Workflow Cheat Sheet 📋

## 🎯 Overview

**Strategy**: Simple 3-branch workflow for solo development
- **Dev** - Main working branch (90% of time here)
- **Master** - Stable "production" testing branch  
- **Feature branches** - Experimental/risky work

---

## 🛠️ Git Aliases (Already Set Up)

```bash
git st              # git status
git co              # git checkout  
git br              # git branch
git sync-dev        # git pull origin Dev
git promote-to-master  # Complete Dev → Master promotion
```

---

## 📖 Daily Workflows

### 🔄 **Regular Development** (90% of time)

**Work directly on Dev branch:**
```bash
git st                              # Check status
git add .                          # Stage all changes
git commit -m "feat: description"  # Commit with good message
git push origin Dev                # Push to remote
```

**Commit Message Prefixes:**
- `feat:` - New features
- `fix:` - Bug fixes  
- `chore:` - Maintenance (docs, config, etc.)
- `experiment:` - Experimental work

---

### 🧪 **Experimental Features** (risky/uncertain work)

**Create experiment branch:**
```bash
git co -b feature/experiment-name Dev   # Create from Dev
# ... work on experimental code ...
git add . && git commit -m "experiment: trying new approach"
```

**If experiment WORKS:**
```bash
git co Dev                          # Switch to Dev
git merge feature/experiment-name   # Merge experiment  
git br -d feature/experiment-name   # Delete feature branch
git push origin Dev                 # Push updated Dev
```

**If experiment FAILS:**
```bash
git co Dev                          # Switch to Dev (abandon experiment)
git br -D feature/experiment-name   # Force delete branch
# Experiment completely gone! 🗑️
```

---

### 🚀 **Deploy to Master** (when ready for testing)

**One-command promotion:**
```bash
git promote-to-master
```

**What this does:**
1. Switches to master
2. Pulls latest master  
3. Merges Dev into master
4. Pushes master to GitHub
5. Returns to Dev branch

---

## 📚 Common Scenarios

### **Starting New Work**
```bash
git co Dev              # Make sure on Dev
git sync-dev            # Get latest changes
# Start coding...
```

### **Quick Status Check**
```bash
git st                  # Current status
git br                  # Show branches
git log --oneline -5    # Recent commits
```

### **Sync with Remote**
```bash
git sync-dev            # Update Dev from remote
git push origin Dev     # Push local Dev to remote
```

### **View Branch History**
```bash
git log --oneline --graph --all -10
```

---

## ⚡ Quick Commands Reference

| Task | Command |
|------|---------|
| Check status | `git st` |
| Switch branches | `git co <branch-name>` |
| Create new branch | `git co -b <branch-name> Dev` |
| Delete merged branch | `git br -d <branch-name>` |
| Force delete branch | `git br -D <branch-name>` |
| Stage all changes | `git add .` |
| Stage specific file | `git add <filename>` |
| Commit changes | `git commit -m "message"` |
| Push to remote | `git push origin <branch-name>` |
| Merge branch | `git merge <branch-name>` |
| Promote to master | `git promote-to-master` |

---

## 🎯 Best Practices

### **Commit Messages**
- Use descriptive prefixes: `feat:`, `fix:`, `chore:`, `experiment:`
- Keep first line under 50 characters
- Be specific: "Add user authentication" not "Update code"

### **Branch Names**
- Use descriptive names: `feature/user-dashboard`
- Avoid spaces: use hyphens or underscores
- Include purpose: `experiment/new-algorithm`

### **When to Branch**
- ✅ **Use feature branches for**: Risky experiments, major changes, uncertain approaches
- ✅ **Work directly on Dev for**: Regular features, bug fixes, documentation

### **Master Branch**
- Only promote when Dev is stable and ready for testing
- Think of master as your "staging environment"
- Test master before considering it "done"

---

## 🚨 Emergency Commands

### **Undo Last Commit (before push)**
```bash
git reset --soft HEAD~1   # Keep changes, undo commit
git reset --hard HEAD~1   # Delete changes and commit ⚠️
```

### **Discard Uncommitted Changes**
```bash
git restore <filename>    # Discard specific file
git restore .            # Discard all changes ⚠️
```

### **Switch Branches with Uncommitted Changes**
```bash
git stash               # Save changes temporarily
git co <other-branch>   # Switch branches  
git co Dev              # Switch back
git stash pop           # Restore saved changes
```

---

## 🔄 Complete Example Workflow

```bash
# 1. Start new feature
git co Dev && git sync-dev

# 2. Regular development
git add . && git commit -m "feat: add user login"
git push origin Dev

# 3. Try risky experiment  
git co -b feature/new-auth-system Dev
git add . && git commit -m "experiment: trying OAuth"

# 4a. If experiment works
git co Dev && git merge feature/new-auth-system
git br -d feature/new-auth-system && git push origin Dev

# 4b. If experiment fails
git co Dev && git br -D feature/new-auth-system

# 5. Deploy when ready
git promote-to-master
```

---

## 💡 Pro Tips

- 🔄 Always return to Dev branch after finishing work
- 💾 Commit frequently with small, focused changes  
- 🧪 Don't be afraid to experiment - feature branches are safe!
- 📝 Use descriptive commit messages for future reference
- 🚀 Only promote to master when you're confident in the code
- 🧹 Clean up merged feature branches regularly
- 📊 Use `git log --oneline --graph --all` to visualize branch history

---

**Happy coding! 🎉** 