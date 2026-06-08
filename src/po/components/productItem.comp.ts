import { Locator } from "@playwright/test";
import { logStep } from "utils/reporter.utils";

export class ProductItem {
    private productName: Locator;
    private productDescription: Locator;
    private addToCartBtn: Locator;
    private removeFromCartBtn: Locator;

    constructor(private root: Locator) {
        this.productName = this.root.locator('[data-test="inventory-item-name"]');
        this.productDescription = this.root.locator('[data-test="inventory-item-desc"]');
        this.addToCartBtn = this.root.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
        this.removeFromCartBtn = this.root.locator('[data-test="remove-sauce-labs-backpack"]');
    }

    @logStep("Add product to cart")
    async addToCart() {
        await this.addToCartBtn.click();
    }

    @logStep("Remove product from cart")
    async removeFromCart() {
        await this.removeFromCartBtn.click();
    }
}