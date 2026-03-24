import { test, expect } from '@playwright/test';

test('Autocomplete datas', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  const searchInput = page.locator('.search');
  const autocompleteList = page.locator('#autocomplete-list');

  // 1. Wait for the input to be visible and type "Naruto"
  await searchInput.fill('Naruto');

  // 2. Wait for the autocomplete list to appear  and check if it's visible
  await expect(autocompleteList).toBeVisible({ timeout: 5000 });

  // 3. Check if there are any items in the autocomplete list
  const items = autocompleteList.locator('a');
  const count = await items.count();
  
  expect(count).toBeGreaterThan(0);
  
  // 4. Check if the first item contains "Naruto"
  await expect(items.first()).toContainText(/Naruto/i);
});