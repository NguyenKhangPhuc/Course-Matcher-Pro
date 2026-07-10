import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Forget Password page ("/forget-password").
 */
export class ForgetPasswordPage {
    readonly page: Page;

    readonly emailInput: Locator;
    readonly submitBtn: Locator;
    readonly emailError: Locator;
    readonly backToSignInLink: Locator;
    readonly signUpLink: Locator;

    constructor(page: Page) {
        this.page = page;

        this.emailInput = page.getByTestId('forget-password-email-input');
        this.submitBtn = page.getByTestId('forget-password-submit-btn');
        this.emailError = page.getByTestId('forget-password-email-error');
        this.backToSignInLink = page.getByRole('link', { name: 'Back to sign in' });
        this.signUpLink = page.getByRole('link', { name: 'Sign Up' });
    }

    async navigateTo(): Promise<void> {
        await this.page.goto('/forget-password');
    }

    async fillEmail(email: string): Promise<void> {
        await this.emailInput.fill(email);
    }

    async submitForm(): Promise<void> {
        await this.submitBtn.click();
    }
}
