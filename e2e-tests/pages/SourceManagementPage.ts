import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Source Management page ("/source-management").
 */
export class SourceManagementPage {
    readonly page: Page;

    readonly heading: Locator;
    readonly sourcesTable: Locator;
    readonly sourceRows: Locator;
    readonly nestedCoursesPanel: Locator;
    readonly courseRows: Locator;
    readonly emptySourcesMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        this.heading = page.getByTestId('source-management-heading');
        this.sourcesTable = page.getByTestId('sources-table');
        this.sourceRows = page.getByTestId('source-row');
        this.nestedCoursesPanel = page.getByTestId('nested-courses-panel').first();
        this.courseRows = page.getByTestId('course-row');
        this.emptySourcesMessage = page.getByTestId('empty-sources-message');
    }

    async navigateTo(): Promise<void> {
        await this.page.goto('/source-management');
    }

    async expandFirstSource(): Promise<void> {
        await this.sourceRows.first().click();
    }
}
