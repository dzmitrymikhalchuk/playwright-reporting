
import { test as uiServices } from "./ui-services.fixture";
import { expect, mergeTests } from "@playwright/test";

const test = mergeTests(
  uiServices
);

export { expect, test };
