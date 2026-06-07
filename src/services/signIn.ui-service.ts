import { Page } from "@playwright/test";
import { SignInPage}  from "po/signIn.page";
import { HomePage } from "po/home.page";

export class SignInService {
    private signInPage: SignInPage;
    private homePage: HomePage;

    constructor(private page: Page) {
        this.signInPage = new SignInPage(page);
        this.homePage = new HomePage(page);
    }

    async signIn() {
        await this.signInPage.open();
        await this.signInPage.fillCredentials({ username: "standard_user", password: "secret_sauce" });
        await this.signInPage.clickLoginButton();
        await this.homePage.waitForOpened();
    }   

}