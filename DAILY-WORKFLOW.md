# 📋 Daily Developer Workflow - Simple Steps

## 🚀 One-Time Setup (Each Developer)

### Developer 1 (Frontend):
```bash
git clone https://github.com/rxmbtw/FluidJobs.ai.git
cd FluidJobs.ai
git checkout feature/frontend-dev
```

### Developer 2 (Backend):
```bash
git clone https://github.com/rxmbtw/FluidJobs.ai.git
cd FluidJobs.ai
git checkout feature/backend-dev
```

### Developer 3 (Database):
```bash
git clone https://github.com/rxmbtw/FluidJobs.ai.git
cd FluidJobs.ai
git checkout feature/database-dev
```

## 📅 Daily Steps (Every Developer)

### 1. Start of Day (9 AM)
```bash
# Get latest changes
git pull origin main
```

### 2. During Development (9 AM - 6 PM)
```bash
# Make your changes to files
# Save files

# Commit every hour
git add .
git commit -m "your change description"
git push
```

### 3. End of Day (6 PM)
```bash
# Final commit
git add .
git commit -m "end of day changes"
git push

# Merge to dev branch
git checkout dev
git pull origin dev
git merge feature/your-branch-name
git push origin dev

# Go back to your branch
git checkout feature/your-branch-name
```

## 🎯 File Assignment (What to Edit)

### Developer 1 - Edit These Files:
```
FluidJobs.ai/src/components/
FluidJobs.ai/src/pages/
FluidJobs.ai/src/styles/
```

### Developer 2 - Edit These Files:
```
backend/routes/
backend/controllers/
backend/middleware/
```

### Developer 3 - Edit These Files:
```
backend/config/
backend/utils/
SQL files
```

## 🔄 Weekly Integration (Friday 6 PM)

### Team Lead Only:
```bash
# Test dev branch
git checkout dev
npm test

# If tests pass, merge to main
git checkout main
git merge dev
git push origin main
```

## 🚨 If You Get Errors

### "Merge Conflict":
```bash
# Open conflicted files
# Look for <<<< ==== >>>>
# Fix manually
git add .
git commit -m "fix conflicts"
git push
```

### "Push Rejected":
```bash
git pull origin main
# Fix any conflicts
git push
```

## ⚡ Quick Commands

### Check Status:
```bash
git status
```

### See Your Branch:
```bash
git branch
```

### Switch Branch:
```bash
git checkout feature/your-branch-name
```

### Emergency Reset:
```bash
git reset --hard origin/main
```

## 📝 Commit Message Examples
```bash
git commit -m "add login button"
git commit -m "fix database connection"
git commit -m "update user profile page"
git commit -m "add new API endpoint"
```

## ✅ Daily Checklist
- [ ] Pull latest changes (morning)
- [ ] Make your changes
- [ ] Commit every hour
- [ ] Push to your branch
- [ ] Merge to dev (end of day)
- [ ] Test application works