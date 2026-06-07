import { BasePage } from "./base.page";

export class HomePage extends BasePage {
    uniqueElement = this.page.locator('[data-test="title"]');
}