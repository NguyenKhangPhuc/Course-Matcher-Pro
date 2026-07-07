import { test, expect } from '@playwright/test';
import { SignUpPage } from './pages/SignUpPage';

/**
 * Generates a unique email per test run so re-running the suite against
 * a real Supabase backend does not collide with "User already existed".
 */
function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now()}.${Math.floor(Math.random() * 10000)}@example.com`;
}

test.describe('Sign Up Flow', () => {

    test('should successfully submit valid sign up details and redirect to verify-account page', async ({ page }) => {
        /**
         * Target: Sign Up Page - Happy Path Submission
         * Scenario: Fill in a valid full name, unique email, and password (8+ chars),
         *           accept the Terms & Conditions, then submit the form.
         * Expectation: The user is redirected to "/sign-up/verify-account" with the
         *              submitted email present in the query string, and a success
         *              notification is shown.
         */
        const signUpPage = new SignUpPage(page);
        const email = uniqueEmail('e2e.signup');

        await signUpPage.navigateTo();
        await signUpPage.signUp('E2E Test User', email, 'SecurePass123');

        await expect(page.getByText('Sign up successfully, please verify your email')).toBeVisible();
    });

    test('should show validation errors when submitting an empty form', async ({ page }) => {
        /**
         * Target: Sign Up Page - Client-side Validation
         * Scenario: Click "Sign Up" without filling any field.
         * Expectation: Full Name, Email, Password, and Terms checkbox all show
         *              their respective "required" validation messages, and the
         *              user remains on the Sign Up page.
         */
        const signUpPage = new SignUpPage(page);

        await signUpPage.navigateTo();
        await signUpPage.submitForm();

        await expect(signUpPage.fullNameError).toBeVisible();
        await expect(signUpPage.emailError).toBeVisible();
        await expect(signUpPage.passwordError).toBeVisible();
        await expect(signUpPage.termsError).toBeVisible();
        await expect(page).toHaveURL(/\/sign-up$/);
    });

    test('should show an invalid email error for a malformed email address', async ({ page }) => {
        /**
         * Target: Sign Up Page - Email Field Validation
         * Scenario: Enter a syntactically invalid email (missing "@domain") along
         *           with valid values for the other fields, then submit.
         * Expectation: An "Invalid Email" message is shown under the Email field
         *              and the form is not submitted.
         */
        const signUpPage = new SignUpPage(page);

        await signUpPage.navigateTo();
        await signUpPage.fillForm('E2E Test User', 'not-an-email', 'SecurePass123');
        await signUpPage.acceptTerms();
        await signUpPage.submitForm();

        await expect(page.getByText('Invalid Email')).toBeVisible();
        await expect(page).toHaveURL(/\/sign-up$/);
    });

    test('should show a password length error when password is shorter than 8 characters', async ({ page }) => {
        /**
         * Target: Sign Up Page - Password Field Validation
         * Scenario: Enter a valid full name and email but a password under 8
         *           characters, then submit.
         * Expectation: A "Password must above 8 characters" message is shown and
         *              the form is not submitted.
         */
        const signUpPage = new SignUpPage(page);

        await signUpPage.navigateTo();
        await signUpPage.fillForm('E2E Test User', uniqueEmail('e2e.shortpass'), 'short');
        await signUpPage.acceptTerms();
        await signUpPage.submitForm();

        await expect(page.getByText('Password must above 8 characters')).toBeVisible();
        await expect(page).toHaveURL(/\/sign-up$/);
    });

    test('should block submission when Terms & Conditions checkbox is not checked', async ({ page }) => {
        /**
         * Target: Sign Up Page - Terms & Conditions Enforcement
         * Scenario: Fill in valid full name, email, and password, but leave the
         *           Terms & Conditions checkbox unchecked, then submit.
         * Expectation: The "You must accept the Terms and Privacy Policy to continue"
         *              message is shown and the user is not redirected.
         */
        const signUpPage = new SignUpPage(page);

        await signUpPage.navigateTo();
        await signUpPage.fillForm('E2E Test User', uniqueEmail('e2e.noterms'), 'SecurePass123');
        await signUpPage.submitForm();

        await expect(signUpPage.termsError).toBeVisible();
        await expect(page).toHaveURL(/\/sign-up$/);
    });

 

    test('should navigate to the Login page when clicking "Sign In"', async ({ page }) => {
        /**
         * Target: Sign Up Page - Navigation to Login
         * Scenario: Click the "Sign In" link at the bottom of the Sign Up form.
         * Expectation: The browser navigates to the "/login" route.
         */
        const signUpPage = new SignUpPage(page);

        await signUpPage.navigateTo();
        await signUpPage.signInLink.click();

        await expect(page).toHaveURL(/\/login$/);
    });
});