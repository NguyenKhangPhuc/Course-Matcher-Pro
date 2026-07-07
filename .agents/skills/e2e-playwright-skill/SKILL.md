---
name: e2e-playwright-skill
description: This skill empowers the agent to analyze user journeys, identify high-value browser automation targets, and generate resilient, fast, and maintainable End-to-End (E2E) and integration tests using Playwright. The agent must ensure all test files follow industry best practices, avoid flakiness, and enforce strict English docstrings detailing the scope and intent of each test block.
---

# Agent Skill: Playwright E2E & Integration Testing Framework

## Purpose
This skill empowers the agent to analyze user journeys, identify high-value browser automation targets, and generate resilient, fast, and maintainable End-to-End (E2E) and integration tests using Playwright. The agent must ensure all test files follow industry best practices, avoid flakiness, and enforce strict English docstrings detailing the scope and intent of each test block.

---

## 0. Scope Discipline (STRICT — read before doing anything else)

The agent must treat every user instruction as scoped **exactly** to what was asked, nothing more.

* **Do only the requested action.** If the user asks to "write a test for the Sign Up page," the agent must produce the Sign Up test/POM only. It must NOT proactively add tests for other pages, other flows, CI/CD configuration, cleanup scripts, environment setup, or "while I'm at it" improvements — even if they seem related or useful.
* **No unsolicited extras.** Suggestions, recommendations, or additional code (e.g., a teardown script, a mocking strategy, an accessibility fix) may be **mentioned in one short sentence at most**, but the agent must NOT generate the actual file/code for it unless the user explicitly asks for it in that turn.
* **One deliverable per turn.** If a request could reasonably be split into multiple pieces of work (e.g., "test the whole app"), the agent must ask which single flow/page to start with, or clearly confirm scope, rather than generating tests for multiple pages/flows at once.
* **Wait for explicit go-ahead.** After finishing the requested item, the agent stops. It does not automatically move on to the "next logical step" (e.g., writing the next page in a flow) without the user sending that file or explicitly asking for it.
* **No silent scope creep in edits.** When asked to fix a bug or answer a question (e.g., "why does this fail sometimes"), the agent must answer/fix *only* that, and must not rewrite unrelated parts of the test suite, refactor other POMs, or add new test cases as a side effect.
* **If ambiguous, ask — don't assume broader scope.** When a command is unclear about how much work is wanted, the agent asks a single clarifying question (or offers 2-4 options) instead of defaulting to "do more to be safe."

---

## 1. Test Identification Strategy (Playwright Focus)
The agent must focus on high-impact user flows and critical UI components rather than testing granular code logic.

### What to Test (High Priority)
* **Critical User Journeys (Happy Paths):** Core workflows that define application value (e.g., User Sign Up, Authentication/Login, Checkout/Payment funnels, Form submissions).
* **Multi-Page & Integration Flows:** Features that require navigating across multiple routes, handling state changes, or interacting with persistent storage (LocalStore/Cookies).
* **Cross-Browser & Responsive Layouts:** Verification that responsive elements (e.g., mobile hamburger menus, modal overlays) function correctly under different viewport sizes.
* **Complex UI Elements:** File uploaders, drag-and-drop interfaces, data grids, and dynamic charts.

### What NOT to Test (Low Priority)
* Visual states or CSS properties that are better handled by Component/Unit tests or Snapshot testing utilities (unless explicit functional behavior is tied to them).
* Raw API endpoints in isolation (prefer dedicated backend Integration/API testing layers, though Playwright's API mocking is encouraged).

---

## 2. Test Architecture & Best Practices

### Page Object Model (POM) Design Pattern
For maintainability, the agent must separate page structure (locators, actions) from the actual test assertions using the **Page Object Model**. This ensures that if the UI markup changes, updates are made in one localized class rather than across dozens of test scripts.

### Best Practices
* **Resilient Locators:** Prefer user-facing attributes using Playwright's built-in locators (e.g., `page.getByRole()`, `page.getByText()`, `page.getByLabel()`) over fragile CSS classes or XPath strings.
* **Auto-Waiting Over Hard Timeouts:** Never use hardcoded wait timers like `page.waitForTimeout(3000)`. Rely on Playwright's automatic waiting and web-first assertions (`expect(locator).toBeVisible()`).
* **State Isolation:** Isolate test execution states. Use Playwright’s global setup configurations to handle authentication once (`storageState`), bypassing login forms for subsequent tests to maximize speed.

---

## 3. Code & Documentation Standards

* **Language:** All test files, POM definitions, locators, and documentation must be written exclusively in **English**.
* **Naming Convention:** Use behavioral syntax for test block naming (e.g., `test('should redirect unauthenticated user to login page', async ({ page }) => { ... })`).
* **Required Docstring Format:** Every `test` block must include a block comment or string literal outlining:
    1.  **Target:** The UI feature, page, or user flow being evaluated.
    2.  **Scenario:** The user action sequence and browser state being tested.
    3.  **Expectation:** The expected state change or visible UI response.

---

## 4. Code Example

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('User Authentication Flow', () => {

    test('should successfully log in with valid credentials', async ({ page }) => {
        /**
         * Target: Login Authentication Flow
         * Scenario: Enter valid username and password into the login form and submit.
         * Expectation: The browser should redirect to the Dashboard, displaying a welcome banner.
         */
        // Arrange
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);

        // Act
        await loginPage.navigateTo();
        await loginPage.fillCredentials('valid_user@example.com', 'securePassword123');
        await loginPage.submitForm();

        // Assert
        await expect(page).toHaveURL(/.*\/dashboard/);
        await expect(dashboardPage.welcomeBanner).toBeVisible();
        await expect(dashboardPage.welcomeBanner).toHaveText('Welcome back, User!');
    });
});
```