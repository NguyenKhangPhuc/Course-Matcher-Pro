import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Search History page ("/history").
 */
export class HistoryPage {
  readonly page: Page;

  readonly pageHeader: Locator;
  readonly historyItems: Locator;
  readonly firstHistoryItemHeader: Locator;
  readonly expandedPanel: Locator;

  // Fields inside the first history item
  readonly companyNameText: Locator;
  readonly positionText: Locator;
  readonly programmeText: Locator;
  readonly requirementsText: Locator;

  // Course matches inside the expanded history item
  readonly matchCountText: Locator;
  readonly courseCards: Locator;
  readonly deleteHistoryButton: Locator;

  // Save/Delete Modal
  readonly deleteModalTitle: Locator;
  readonly deleteYesButton: Locator;
  readonly deleteNoButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageHeader = page.getByRole('heading', { name: /History/i });
    this.historyItems = page.getByTestId('history-item');
    // The header button inside the first history item card
    this.firstHistoryItemHeader = this.historyItems.first().getByRole('button').first();
    this.expandedPanel = this.historyItems.first().getByTestId('history-expanded-panel');
    // Text locators scoped to the first item
    this.companyNameText = this.historyItems.first().locator('p').first(); // Company name is the first p element
    this.positionText = this.historyItems.first().locator('p').filter({ hasText: 'Position:' });
    this.programmeText = this.historyItems.first().locator('p').filter({ hasText: 'Programme:' });
    this.requirementsText = this.historyItems.first().locator('p').filter({ hasText: 'Requirements:' });

    // Elements inside the expanded card details
    this.matchCountText = this.historyItems.first().locator('text=Matched Courses');
    this.courseCards = this.historyItems.first().getByTestId('course-match-card');
    this.deleteHistoryButton = this.historyItems.first().getByRole('button', { name: /Delete History/i });

    // Deletion confirmation modal
    this.deleteModalTitle = page.getByText('Do you want to delete this search?');
    this.deleteYesButton = page.getByRole('button', { name: 'Yes', exact: true });
    this.deleteNoButton = page.getByRole('button', { name: 'No', exact: true });
  }

  async navigateTo() {
    await this.page.goto('/history');
  }

  async expandFirstItem() {
    await this.firstHistoryItemHeader.click();
  }

  async clickCourseCard(courseName: string) {
    // Click the card containing the course name to toggle learning outcomes
    await this.courseCards.filter({ hasText: courseName }).click();
  }
}
