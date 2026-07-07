import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for the Login page ("/login").
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;
  readonly termsCheckbox: Locator;
  readonly signInButton: Locator;
  readonly githubButton: Locator;
  readonly signUpLink: Locator;

  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly termsError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('Enter your Email');
    this.passwordInput = page.getByPlaceholder('Enter your Password');
    this.rememberMeCheckbox = page.getByLabel(/Remember me/i);
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.termsCheckbox = page.getByLabel(/Terms & Conditions/i);
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.githubButton = page.getByText('Github');
    this.signUpLink = page.getByRole('link', { name: 'Sign Up' });

    // Field-level validation messages (react-hook-form)
    this.emailError = page.getByText(/Email is required|Invalid Email/);
    this.passwordError = page.getByText(/Password is required|Password must above 8 characters/);
    this.termsError = page.getByText('You must accept the Terms and Privacy Policy to continue');
  }

  async navigateTo() {
    await this.page.goto('/login');
  }

  async fillForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async acceptTerms() {
    await this.termsCheckbox.check();
  }

  async submitForm() {
    await this.signInButton.click();
  }

  /**
   * Convenience helper for the common happy-path: fill credentials,
   * accept terms, and submit.
   */
  async signIn(email: string, password: string) {
    await this.fillForm(email, password);
    await this.acceptTerms();
    await this.submitForm();
  }

  async expectValidationError(locator: Locator, message: string | RegExp) {
    await expect(locator).toBeVisible();
    await expect(locator).toHaveText(message);
  }
}
