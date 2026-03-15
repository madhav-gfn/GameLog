# Alignment & Layout Fixes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harmonize the application's layout by unifying maximum widths, fixing vertical alignment in headers, and preventing awkward text truncation in feed cards.

**Architecture:** We will standardize on a `1440px` maximum width for the primary content spine and remove conflicting internal constraints in the `AppShell` and global CSS.

**Tech Stack:** React, Tailwind CSS

---

### Task 1: Unify Global Layout Widths

**Files:**
- Modify: `frontend/src/App.css`
- Modify: `frontend/src/components/layout/AppShell.jsx`

- [ ] **Step 1: Remove conflicting max-width in App.css**
- [ ] **Step 2: Update NavBar max-width in AppShell.jsx**
- [ ] **Step 3: Update AppShell main container max-width**
- [ ] **Step 4: Commit layout unification**

### Task 2: Fix Home Page Header Alignment

**Files:**
- Modify: `frontend/src/pages/Home.jsx`

- [ ] **Step 1: Adjust header vertical alignment**
- [ ] **Step 2: Commit Home header fix**

### Task 3: Prevent FeedCard Text Truncation

**Files:**
- Modify: `frontend/src/components/FeedCard.jsx`

- [ ] **Step 1: Fix header text wrapping**
- [ ] **Step 2: Commit FeedCard fix**

### Task 4: Standardize GameCard Alignment

**Files:**
- Modify: `frontend/src/components/GameCard.jsx`

- [ ] **Step 1: Unify title heights**
- [ ] **Step 2: Commit GameCard fix**

### Task 5: Verification

- [ ] **Step 1: Verify on wide screens**
- [ ] **Step 2: Verify mobile view**
- [ ] **Step 3: Run build to ensure no regressions**
