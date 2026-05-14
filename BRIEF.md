# Internship Assessment — Frontend / Backend Track

## Overview

You're inheriting a small web application called **FarmTracker** from a previous developer. It's a livestock record management tool — farmers use it to track animals, paddock assignments, and health events.

The app mostly works, but it has known issues and a missing feature. Your job is to:

1. Audit the codebase and document what you find
2. Fix the bugs
3. Implement a new feature
4. Leave the codebase better than you found it

**Time window: 5–7 days.**

---

## The Application

FarmTracker is a small REST API (Node.js / Express) with a simple HTML/JS frontend. It manages:

- **Paddocks** — named enclosures with a defined capacity
- **Animals** — individual livestock assigned to a paddock, with breed and date of birth
- **Health Events** — vet visits, vaccinations, and treatments logged against an animal

Setup instructions are in `app/README.md`.

---

## Deliverables

### 1. Code Review Audit (`AUDIT.md`)

**Write this before touching any code.**

Review the codebase and document:
- What issues do you find? (bugs, design problems, anything that concerns you)
- What would you fix first, and why?
- What would you leave for later?

Length: ~300 words. We're not looking for an exhaustive list — we want to see how you prioritise.

### 2. Bug Fixes

Fix the bugs you identified in your audit. Your commits should be clean and descriptive — not one large squash commit. Each fix should be its own commit with a message explaining *what* and *why*.

### 3. Feature Implementation

Implement the feature described in [`TODO.md`](./TODO.md). Your implementation must include tests. Use whatever testing framework you prefer.

### 4. Architectural Improvement

Identify and address the most significant architectural issue in the codebase. You may implement the fix or, if it's too large in scope, write a concrete proposal (`ARCH_PROPOSAL.md`) that describes exactly how you'd fix it — specific enough that another developer could execute it without asking you questions.

### 5. Retrospective (`RETRO.md`, ~200 words)

After you're done:
- What trade-offs did you make?
- What would you do differently with more time?
- Is there anything in the codebase you deliberately left alone and why?

---

## Stack

The starter app uses Node.js, Express, and SQLite. You are welcome to refactor to a different stack, but if you do, briefly justify the change in your `RETRO.md`. We care more about the quality of your thinking than the specific technology.

---

## What We're Looking For

- **Code comprehension** — Do you understand the system before you change it?
- **Judgment** — Do you identify and prioritise the right problems?
- **Code quality** — Clean commits, readable code, appropriate test coverage
- **Written communication** — Can you explain your decisions clearly?

We expect candidates to use AI coding tools. We're evaluating your judgment in directing those tools, not your ability to avoid them.

---

## Submission

Open a pull request against the `main` branch of your repository and email the link to the hiring contact. The PR description is part of the assessment — treat it as you would a real PR going to a team that hasn't seen your work.

A strong PR description includes:

- **Summary** — what you changed and why, at a level a reviewer can follow without reading every commit
- **Screenshots** — before/after of any UI changes; browser screenshots of the running application with the new feature working
- **Audit findings** — a brief recap of the issues you found and how you prioritised them (this can reference your `AUDIT.md`)
- **What you fixed and how** — for each bug, a one-line explanation of the root cause and what changed
- **Trade-offs** — decisions where you chose one approach over another, and why
- **What you'd do next** — the most important thing left unaddressed, and how you'd tackle it

Make sure `app/README.md` accurately reflects how to run the application after your changes. A reviewer should be able to follow it cold.

A PR description that is thin, vague, or just a list of files changed will be scored accordingly.
