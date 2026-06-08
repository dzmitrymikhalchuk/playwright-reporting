import { logStep } from "utils/reporter.utils";
import { BasePage } from "./base.page";
import { Credentials } from "types/signIn.types";

export class SignInPage extends BasePage {
  usernameInput = this.page.locator('[data-test="username"]');
  passwordInput = this.page.locator('[data-test="password"]');
  loginButton = this.page.locator('[data-test="login-button"]');
  uniqueElement = this.loginButton;

  @logStep("Fill in credentials")
  async fillCredentials({ username, password }: Credentials) {
    username && (await this.usernameInput.fill(username));
    password && (await this.passwordInput.fill(password));
  }

  @logStep("Submit login form")
  async clickLoginButton() {
    await this.loginButton.click();
}

}