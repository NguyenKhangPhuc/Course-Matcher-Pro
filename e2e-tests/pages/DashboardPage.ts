import { Page, Locator } from '@playwright/test';

/**
 * Page Object for the Dashboard page ("/dashboard").
 */
export class DashboardPage {
  readonly page: Page;

  // Course Data Section
  readonly courseDataTitle: Locator;
  readonly fileInput: Locator;
  readonly dropzone: Locator;
  readonly dropzoneText: Locator;
  readonly courseTable: Locator;
  readonly courseTableRows: Locator;
  readonly programmeSelect: Locator;
  readonly sourcePills: Locator;

  // Target Job Form
  readonly targetJobTitle: Locator;
  readonly companyInput: Locator;
  readonly positionInput: Locator;
  readonly jobDescInput: Locator;
  readonly analyzeButton: Locator;

  // Field errors
  readonly companyError: Locator;
  readonly positionError: Locator;
  readonly jobDescError: Locator;

  // Analysis Results Section
  readonly resultsSection: Locator;
  readonly resultsTitle: Locator;
  readonly requirementsText: Locator;
  readonly courseCards: Locator;

  // Save Modal
  readonly saveModalTitle: Locator;
  readonly saveYesButton: Locator;
  readonly saveNoButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Course Data Section
    this.courseDataTitle = page.getByRole('heading', { name: /Course Data/i });
    this.fileInput = page.locator('#file-input');
    this.dropzone = page.locator('.dashboard-dropzone');
    this.dropzoneText = page.locator('.dashboard-dropzone-text');
    this.courseTable = page.locator('.dashboard-table');
    this.courseTableRows = page.locator('.dashboard-table tbody tr');

    // Now using getByLabel because of the added htmlFor/id connection
    this.programmeSelect = page.getByLabel('Programme');
    this.sourcePills = page.locator('.dashboard-pill');

    // Target Job Form
    this.targetJobTitle = page.getByRole('heading', { name: /Target Job/i });

    // Now using getByLabel because of the added htmlFor/id connection
    this.companyInput = page.getByLabel('Company Name');
    this.positionInput = page.getByLabel('Position');
    this.jobDescInput = page.getByLabel('Job Description');

    this.analyzeButton = page.getByRole('button', { name: /Start Analyze/i });

    // Target Job Form Errors
    this.companyError = page.getByText('Company name is required');
    this.positionError = page.getByText('Position is required');
    this.jobDescError = page.getByText(/Job description is required|Please provide more detail/);

    // Analysis Results Section
    this.resultsSection = page.locator('.dashboard-results');
    this.resultsTitle = page.getByRole('heading', { name: /Analysis Results/i });
    this.requirementsText = page.locator('.dashboard-requirements-text');
    this.courseCards = page.locator('.dashboard-results-grid > div');

    // Save Modal
    this.saveModalTitle = page.getByText('Do you want to save your search?');
    this.saveYesButton = page.getByRole('button', { name: 'Exact', exact: true });
    this.saveNoButton = page.getByRole('button', { name: 'No', exact: true });
  }

  async navigateTo() {
    await this.page.goto('/dashboard');
  }

  async selectSource(sourceName: string) {
    await this.page.getByRole('button', { name: sourceName, exact: true }).click();
  }

  async selectProgramme(programme: string) {
    await this.programmeSelect.selectOption({ label: programme });
  }

  async fillJobForm(company: string, position: string, jobDesc: string) {
    await this.companyInput.fill(company);
    await this.positionInput.fill(position);
    await this.jobDescInput.fill(jobDesc);
  }

  async submitJobForm() {
    await this.analyzeButton.click();
  }

  async uploadFile(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
  }
}
