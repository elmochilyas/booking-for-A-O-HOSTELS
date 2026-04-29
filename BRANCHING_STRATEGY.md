# A&O Hostels - Git Branching Strategy

## Branch Types

| Branch | Purpose | Base | Merges To |
|--------|---------|------|-----------|
| `main` | Production-ready code | - | - |
| `develop` | Integration branch | main | main |
| `feature/*` | New features | develop | develop |
| `fix/*` | Bug fixes | develop | develop |
| `hotfix/*` | Urgent production fixes | main | main & develop |
| `release/*` | Release preparation | develop | main & develop |

---

## Workflow

```
main ─────────────────────────────────────────────────────►
  ↑
  │    hotfix/* (if urgent)
  │
develop ◄─── feature/* ◄─── feature/*
  ↑
  │    release/*
  │
main
```

---

## Naming Conventions

- **Features:** `feature/TASK-XXX-description`
  - Example: `feature/TASK-013-booking-engine`
  
- **Bug Fixes:** `fix/TASK-XXX-description`
  - Example: `fix/TASK-040-database-optimization`
  
- **Hotfixes:** `hotfix/TASK-XXX-description`
  - Example: `hotfix/payment-webhook-failure`

- **Releases:** `release/v1.0.0`

---

## Process

### 1. Start New Feature
```bash
git checkout develop
git pull origin develop
git checkout -b feature/TASK-XXX-description
```

### 2. Work on Feature
```bash
git add .
git commit -m "TASK-XXX: Description"
```

### 3. Push & Create PR
```bash
git push -u origin feature/TASK-XXX-description
# Create PR: develop ← feature/TASK-XXX
# Requires: 1 review approval
```

### 4. After Merge
```bash
git checkout develop
git pull origin develop
git branch -d feature/TASK-XXX-description
```

---

## Rules

1. **Never push directly to main**
2. **Never merge develop into main**
3. **All PRs require review**
4. **Delete branch after merge**
5. **Use conventional commits**

---

## Current Phase: Phase 1 MVP

| Task Range | Module |
|------------|--------|
| TASK-001 to TASK-006 | Project Setup |
| TASK-007 to TASK-012 | Authentication |
| TASK-013 to TASK-020 | Booking Engine |
| TASK-021 to TASK-026 | Payment Processing |
| TASK-027 to TASK-033 | Staff/Admin |
| TASK-034 to TASK-044 | Testing & Launch |