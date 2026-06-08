import { test, expect } from 'fixtures';
import { TAGS } from 'data/tags';
import { BASE_URL } from 'config/environment';

test.describe('[ADO-120] Failed test', {tag: [TAGS.REGRESSION]}, () => {
    test('has title', async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page).toHaveTitle(/Playwright/);
    });
});