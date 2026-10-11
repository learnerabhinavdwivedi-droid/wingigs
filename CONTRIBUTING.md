# Contributing to Bahar

Thank you for your interest in contributing to **Bahar**! We are building the most resilient, failure-tolerant athletic training platform in the world.

---

## 1. Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful and considerate in all interactions across issues, pull requests, and discussions.

---

## 2. Getting Started

### Prerequisites
- **Node.js**: Version 20 LTS or Version 22 LTS
- **npm**: Version 10 or higher
- **Git**

### Installation
1. Fork and clone the repository:
   ```bash
   git clone https://github.com/learnerabhinavdwivedi-droid/wingigs.git
   cd wingigs/bahar
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env.local
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Development Workflow

### Branch Naming Conventions
- `feat/feature-name` - New features
- `fix/bug-fix-name` - Bug fixes
- `perf/optimization` - Performance improvements
- `docs/documentation-update` - Documentation changes
- `refactor/code-refactoring` - Code refactoring without behavior changes

### Commit Message Guidelines
Follow conventional commit standards:
- `feat: add workout audio cues for interval rest`
- `fix: prevent layout shift on mobile court view`
- `perf: optimize indexeddb query indexing for check-ins`
- `docs: update architecture diagram in README`

---

## 4. Verification & Testing

Before submitting a Pull Request, verify that all test suites pass cleanly:

```bash
# 1. Typecheck
npm run typecheck

# 2. Run Unit Tests (Vitest)
npm run test:unit

# 3. Run End-to-End Tests (Playwright)
npm run test:e2e

# 4. Production Build Verification
npm run build
```

---

## 5. Architectural Principles to Respect

When adding or modifying features, preserve these non-negotiable architectural guarantees:
1. **Offline-First Resilience**: Any core training feature must work with zero network connectivity using local IndexedDB.
2. **Zero Shame UI**: When an athlete misses workouts or scores low recovery, never display red broken streaks or negative feedback. Always adapt the envelope constructively.
3. **Typography & Theme Integrity**: Keep UI typography clean using `Geist Sans`, respecting both Light and Dark themes.

---

## 6. Submitting a Pull Request

1. Push your branch to your GitHub fork.
2. Open a Pull Request targeting the `main` branch.
3. Complete all sections of the PR template.
4. Ensure CI checks pass.
5. Address any code review feedback.
