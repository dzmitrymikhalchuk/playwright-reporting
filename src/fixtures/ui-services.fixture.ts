import { test as base } from "@playwright/test";
import { SignInService } from "services/signIn.ui-service";

interface UIServices {
    signInService: SignInService;
}

export const test = base.extend<UIServices>({
    signInService: async ({ page }, use) => {
        await use(new SignInService(page));
    }
});

