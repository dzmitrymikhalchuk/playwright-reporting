import { Locator } from "@playwright/test";
import { logStep } from "utils/reporter.utils";

export class HeaderComponent {
    static readonly selector = '#header_container';

    private logo: Locator;
    private burgerMenuButton: Locator;
    private cartLink: Locator;
    private cartBadge: Locator;
    private menuAllItems: Locator;
    private menuAbout: Locator;
    private menuLogout: Locator;
    private menuResetState: Locator;
    private closeMenuButton: Locator;

    constructor(root: Locator) {
        this.logo = root.locator('.app_logo');
        this.burgerMenuButton = root.locator('#react-burger-menu-btn');
        this.cartLink = root.locator('[data-test="shopping-cart-link"]');
        this.cartBadge = root.locator('[data-test="shopping-cart-badge"]');
        this.menuAllItems = root.locator('#inventory_sidebar_link');
        this.menuAbout = root.locator('#about_sidebar_link');
        this.menuLogout = root.locator('#logout_sidebar_link');
        this.menuResetState = root.locator('#reset_sidebar_link');
        this.closeMenuButton = root.locator('#react-burger-cross-btn');
    }

    async openMenu() {
        await this.burgerMenuButton.click();
    }

    async closeMenu() {
        await this.closeMenuButton.click();
    }

    async logout() {
        await this.openMenu();
        await this.menuLogout.click();
    }

    async goToAllItems() {
        await this.openMenu();
        await this.menuAllItems.click();
    }

    async goToAbout() {
        await this.openMenu();
        await this.menuAbout.click();
    }

    async resetAppState() {
        await this.openMenu();
        await this.menuResetState.click();
    }

    @logStep("Go to cart page")
    async goToCart() {
        await this.cartLink.click();
    }

    get cartBadgeLocator() {
        return this.cartBadge;
    }

    async getCartCount() {
        const visible = await this.cartBadge.isVisible();
        if (!visible) return 0;
        return parseInt(await this.cartBadge.innerText(), 10);
    }

    @logStep("Get logo text")
    async getLogoText() {
        return this.logo.innerText();
    }
}
