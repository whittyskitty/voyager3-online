# Test info

- Name: Vendor Backend Credits Manager >> should load and display vendors in dropdown
- Location: /Users/scottwhitaker/Sites/voyager3/pricing-editor/src/__tests__/vendor-backend-credits-manager.spec.ts:10:7

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toBeVisible()

Locator: locator('select').first()
Expected: visible
Received: <element(s) not found>
Call log:
  - expect.toBeVisible with timeout 5000ms
  - waiting for locator('select').first()

    at /Users/scottwhitaker/Sites/voyager3/pricing-editor/src/__tests__/vendor-backend-credits-manager.spec.ts:13:34
```

# Page snapshot

```yaml
- heading "404" [level=1]
- heading "This page could not be found." [level=2]
- alert
- button "Open Next.js Dev Tools":
  - img
```

# Test source

```ts
   1 | import { test, expect } from '@playwright/test';
   2 |
   3 | test.describe('Vendor Backend Credits Manager', () => {
   4 |   test.beforeEach(async ({ page }) => {
   5 |     // Navigate to the page with the component
   6 |     await page.goto('http://localhost:3000/pricing-editor');
   7 |     console.log('Navigated to page:', await page.url());
   8 |   });
   9 |
  10 |   test('should load and display vendors in dropdown', async ({ page }) => {
  11 |     // Wait for the vendor dropdown to be visible
  12 |     const vendorDropdown = page.locator('select').first();
> 13 |     await expect(vendorDropdown).toBeVisible();
     |                                  ^ Error: Timed out 5000ms waiting for expect(locator).toBeVisible()
  14 |
  15 |     // Check if the default "Select a vendor..." option is present
  16 |     await expect(vendorDropdown.locator('option:first-child')).toHaveText('Select a vendor...');
  17 |
  18 |     // Wait for vendors to be loaded (you might need to adjust this based on your actual loading state)
  19 |     await page.waitForTimeout(1000);
  20 |
  21 |     // Check if vendor options are populated
  22 |     const vendorOptions = vendorDropdown.locator('option');
  23 |     await expect(vendorOptions).toHaveCount(2); // At least 2 options (default + one vendor)
  24 |   });
  25 |
  26 |   test('should update default percentage when vendor is selected', async ({ page }) => {
  27 |     // Select a vendor from the dropdown
  28 |     const vendorDropdown = page.locator('select').first();
  29 |     await vendorDropdown.selectOption({ index: 1 }); // Select the first vendor (after default option)
  30 |
  31 |     // Wait for the default percentage to be updated
  32 |     await page.waitForTimeout(1000);
  33 |
  34 |     // Get the default percentage input
  35 |     const defaultPercentageInput = page.locator('input[type="number"]').first();
  36 |
  37 |     // Check if the default percentage is a valid number
  38 |     const percentageValue = await defaultPercentageInput.inputValue();
  39 |     expect(Number(percentageValue)).not.toBeNaN();
  40 |   });
  41 |
  42 |   test('should display vendor rules after selection', async ({ page }) => {
  43 |     // Select a vendor from the dropdown
  44 |     const vendorDropdown = page.locator('select').first();
  45 |     await vendorDropdown.selectOption({ index: 1 });
  46 |
  47 |     // Wait for rules to be loaded
  48 |     await page.waitForTimeout(1000);
  49 |
  50 |     // Check if rules section is visible
  51 |     const rulesSection = page.locator('text="Pricing Rules"');
  52 |     await expect(rulesSection).toBeVisible();
  53 |
  54 |     // Check if at least one rule is displayed
  55 |     const ruleCards = page.locator('.bg-gray-50.rounded-lg.p-6.border.border-gray-200');
  56 |     await expect(ruleCards).toHaveCount(1); // At least one rule card
  57 |   });
  58 | }); 
```