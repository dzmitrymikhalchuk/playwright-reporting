import { defineConfig } from "allure";

export default defineConfig({
  qualityGate: {
    rules: [{ successRate: 1.0, maxFailures: 0 }],
  },
});