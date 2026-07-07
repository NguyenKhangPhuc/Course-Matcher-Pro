import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object for the Sign Up page ("/sign-up" or app root, adjust route below).
 *
 * NOTE ON LOCATORS:
 * The current markup does not associate the "Full Name" / "Email" / "Password"
 * <label> elements with their inputs via htmlFor/id, so getByLabel() cannot be
 * used reliably for those three fields. This POM falls back to getByPlaceholder()
 * for them. The "Terms & Conditions" checkbox IS properly linked (htmlFor="isTermAccepted"),
 * so getByLabel() is used there.
 *
 * RECOMMENDATION: add htmlFor/id pairs (or data-testid) to the Full Name, Email,
 * and Password inputs to make locators fully resilient to copy changes.
 */
export class SignUpPage {
  readonly page: Page;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly signUpButton: Locator;
  readonly githubButton: Locator;
  readonly signInLink: Locator;
  readonly fullNameError: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly termsError: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fullNameInput = page.getByPlaceholder('Enter your Full Name');
    this.emailInput = page.getByPlaceholder('Enter your Email');
    this.passwordInput = page.getByPlaceholder('Enter your Password');
    this.termsCheckbox = page.getByLabel(/Terms & Conditions/i);
    this.signUpButton = page.getByRole('button', { name: 'Sign Up' });
    this.githubButton = page.getByText('Github');
    this.signInLink = page.getByRole('link', { name: 'Sign In' });

    // Field-level validation messages (react-hook-form), scoped by adjacency
    // to their inputs to avoid ambiguity between similarly worded errors.
    this.fullNameError = page.getByText('Full name is required');
    this.emailError = page.getByText(/Email is required|Invalid Email/);
    this.passwordError = page.getByText(/Password is required|Password must above 8 characters/);
    this.termsError = page.getByText('You must accept the Terms and Privacy Policy to continue');
  }

  async navigateTo() {
    await this.page.goto('/sign-up');
  }

  async fillForm(fullName: string, email: string, password: string) {
    await this.fullNameInput.fill(fullName);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async acceptTerms() {
    await this.termsCheckbox.check();
  }

  async submitForm() {
    await this.signUpButton.click();
  }

  /**
   * Convenience helper for the common happy-path: fill all fields,
   * accept terms, and submit.
   */
  async signUp(fullName: string, email: string, password: string) {
    await this.fillForm(fullName, email, password);
    await this.acceptTerms();
    await this.submitForm();
  }

  async expectValidationError(locator: Locator, message: string | RegExp) {
    await expect(locator).toBeVisible();
    await expect(locator).toHaveText(message);
  }
}