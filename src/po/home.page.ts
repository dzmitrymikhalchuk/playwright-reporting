import { BasePage } from "./base.page";
import { logStep } from "utils/reporter.utils";
import { ProductItem } from "./components/productItem.comp";
import { HeaderComponent } from "./components/header.comp";

export class HomePage extends BasePage {
    uniqueElement = this.page.locator('[data-test="title"]');
    header = new HeaderComponent(this.page.locator(HeaderComponent.selector));
    productItem(name: string) {
        return new ProductItem(this.page.locator('[data-test="inventory-item"]', { hasText: name }));
    }
}