import { test, expect } from "fixtures";
import { HomePage } from "po/home.page";
import { TAGS } from "data/tags";

test.describe("[ADO-220] Add product to cart", () => {
  test("Add single product to cart", { tag: [TAGS.REGRESSION, TAGS.PRODUCT] }, async ({ signInService, productService }) => {
    await signInService.signIn();
    await productService.addProductToCart("Sauce Labs Backpack");
  });
});