import { Page, FrameLocator } from '@playwright/test';

export class DatePickerPage {
  private frame: FrameLocator;

  constructor(private readonly page: Page) {
    this.frame = this.page.locator('iframe[class*="demo-frame"]').contentFrame();
  }

  // Locators
  get dateInput() {
    return this.frame.locator('#datepicker');
  }

  get calendarWidget() {
    return this.frame.locator('#ui-datepicker-div');
  }

  get monthDropdown() {
    return this.frame.locator('.ui-datepicker-month');
  }

  get yearDropdown() {
    return this.frame.locator('.ui-datepicker-year');
  }

  get prevButton() {
    return this.frame.getByTitle('Prev');
  }

  get nextButton() {
    return this.frame.getByTitle('Next');
  }

  getDayLink(day: string) {
    return this.frame.getByRole('link', { name: day, exact: true });
  }

  getDisabledDay(day: string) {
    return this.frame.locator(`td.ui-datepicker-unselectable:has-text("${day}")`);
  }

  async selectMonth(month: string) {
    await this.monthDropdown.selectOption(month);
  }

  async selectYear(year: string) {
    await this.yearDropdown.selectOption(year);
  }
}
