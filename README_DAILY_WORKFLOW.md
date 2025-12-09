# 🔄 FluidJobs.ai — Daily Git Workflow Guide (Amazon Q)

This file contains the **daily Git command guide** for all developers — **Shobhit**, **Meet**, and **Ram** — to use inside **VS Code’s Amazon Q**.

---

## 🧩 Branch Structure

```
main                → stable production branch (protected)
└── dev             → shared integration branch
     ├── shobhit    → Shobhit’s working branch
     ├── meet       → Meet’s working branch
     └── ram        → Ram’s working branch
```

---

## 👨‍💻 SHOBHIT — Daily Git Workflow (Amazon Q)

💡 Use inside VS Code’s Amazon Q every morning and before closing for the day.

### 🌞 **Start of the Day**

```bash
cd path/to/FluidJobs.ai
git checkout dev
git pull origin dev
git checkout shobhit
git merge dev
```

✅ You now have the latest updates from everyone.

### 💻 **During the Day**

```bash
git add .
git commit -m "Description of your work"
```

💡 Commit often; push when your code is stable.

### 🌙 **End of the Day**

```bash
git add .
git commit -m "Day end: summary of updates"
git push origin shobhit

git checkout dev
git pull origin dev
git checkout shobhit
git merge dev
```

✅ Keeps your local and remote branches perfectly aligned.

### 🚀 **When Ready to Merge**
- GitHub → **Pull Requests → New Pull Request**  
- Base: `dev`  
- Compare: `shobhit`  
- Add title + description → Create PR

### 🧠 **Golden Rule**
> Always **pull → merge → push**,  
> never work directly in `dev` or `main`.

---

## 👨‍💻 MEET — Daily Git Workflow (Amazon Q)

💡 Use this every morning and evening inside VS Code with Amazon Q.

### 🌞 **Start of the Day**

```bash
cd path/to/FluidJobs.ai
git checkout dev
git pull origin dev
git checkout meet
git merge dev
```

✅ Now your branch is fully updated — start coding!

### 💻 **During the Day**

```bash
git add .
git commit -m "Description of your work"
```

💡 Commit locally as you progress; push only when stable.

### 🌙 **End of the Day**

```bash
git add .
git commit -m "Day end: summary of updates"
git push origin meet

git checkout dev
git pull origin dev
git checkout meet
git merge dev
```

✅ Keeps your branch backed up and aligned with `dev`.

### 🚀 **When Ready to Merge**
- GitHub → **Pull Requests → New Pull Request**  
- Base: `dev`  
- Compare: `meet`  
- Add title + description → Create PR

### 🧠 **Golden Rule**
> Always **pull → merge → push**.  
> Never code directly in `dev` or `main`.

---

## 👨‍💻 RAM — Daily Git Workflow (Amazon Q)

💡 Use this in VS Code with Amazon Q each morning and evening.

### 🌞 **Start of the Day**

```bash
cd path/to/FluidJobs.ai
git checkout dev
git pull origin dev
git checkout ram
git merge dev
```

✅ You’re synced with the latest shared updates.

### 💻 **During the Day**

```bash
git add .
git commit -m "Description of your work"
```

💡 Commit regularly; push when your work is tested.

### 🌙 **End of the Day**

```bash
git add .
git commit -m "Day end: summary of updates"
git push origin ram

git checkout dev
git pull origin dev
git checkout ram
git merge dev
```

✅ Keeps your branch current and safe on GitHub.

### 🚀 **When Ready to Merge**
- GitHub → **Pull Requests → New Pull Request**  
- Base: `dev`  
- Compare: `ram`  
- Add title + description → Create PR

### 🧠 **Golden Rule**
> Always **pull → merge → push**,  
> and never work directly in `dev` or `main`.

---

## ⚙️ Quick Summary Table

| Developer | Morning | During Work | End of Day | PR Base | PR Compare |
|------------|----------|--------------|-------------|-----------|-------------|
| **Shobhit** | `git pull origin dev` → `git merge dev` | `git commit -m "..."` | `git push origin shobhit` | `dev` | `shobhit` |
| **Meet** | `git pull origin dev` → `git merge dev` | `git commit -m "..."` | `git push origin meet` | `dev` | `meet` |
| **Ram** | `git pull origin dev` → `git merge dev` | `git commit -m "..."` | `git push origin ram` | `dev` | `ram` |

---

### ✅ Golden Team Rule
> **Always** pull latest → merge into your branch → push to your branch.  
> Never push directly to `dev` or `main`.

---

**Team FluidJobs.ai** — _Git Discipline = No Conflicts 🚀_
