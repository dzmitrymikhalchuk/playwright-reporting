import { defineConfig } from "allure";

export default defineConfig({
  historyPath: "./allure-history",
  qualityGate: {
    rules: [{ successRate: 1.0, maxFailures: 0 }],
  },
});