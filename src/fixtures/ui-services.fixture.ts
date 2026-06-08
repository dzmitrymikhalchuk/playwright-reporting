import { test as base } from "@playwright/test";
import { SignInService } from "services/signIn.ui-service";
import { ProductService } from "services/product.ui-service";

interface UIServices {
    signInService: SignInService;
    productService: ProductService;
}

export const test = base.extend<UIServices>({
    signInService: async ({ page }, use) => {
        await use(new SignInService(page));
    },
    productService: async ({ page }, use) => {
        await use(new ProductService(page));
    },
});

