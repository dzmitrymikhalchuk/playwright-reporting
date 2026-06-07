import { Page, Locator } from "@playwright/test";
import { expect } from "fixtures";
import { BASE_URL } from "config/environment";
import { logStep } from "utils/reporter.utils";

export abstract class BasePage {
  constructor(protected page: Page) {}

  abstract uniqueElement: Locator;

  @logStep("Wait for page to be loaded")
  async waitForOpened() {
    await expect(this.uniqueElement, "Verify unique element on page").toBeVisible();
  }

  @logStep("Open app")
  async open() {
    this.page.goto(BASE_URL);
  }
}