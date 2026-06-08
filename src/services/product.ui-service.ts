import { Page, expect } from "@playwright/test";
import { HomePage } from "po/home.page";
import { logStep } from "utils/reporter.utils";

export class ProductService {
    private homePage: HomePage;

    constructor(page: Page) {
        this.homePage = new HomePage(page);
    }

    @logStep("Add product to cart")
    async addProductToCart(name: string) {
        const countBefore = await this.homePage.header.getCartCount();
        await this.homePage.productItem(name).addToCart();
        await expect(this.homePage.header.cartBadgeLocator).toHaveText(String(countBefore + 1));
    }

    @logStep("Remove product from cart")
    async removeProductFromCart(name: string) {
        const countBefore = await this.homePage.header.getCartCount();
        await this.homePage.productItem(name).removeFromCart();
        const expectedCount = countBefore - 1;
        if (expectedCount === 0) {
            await expect(this.homePage.header.cartBadgeLocator).toBeHidden();
        } else {
            await expect(this.homePage.header.cartBadgeLocator).toHaveText(String(expectedCount));
        }
    }
}
