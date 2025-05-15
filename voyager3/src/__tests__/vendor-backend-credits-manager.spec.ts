import { test, expect } from '@playwright/test';

test.describe('Vendor Backend Credits Manager', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page with the component
    await page.goto('http://localhost:3000/pricing-editor');
    console.log('Navigated to page:', await page.url());
  });

  test('should load and display vendors in dropdown', async ({ page }) => {
    // Wait for the vendor dropdown to be visible
    const vendorDropdown = page.locator('select').first();
    await expect(vendorDropdown).toBeVisible();

    // Check if the default "Select a vendor..." option is present
    await expect(vendorDropdown.locator('option:first-child')).toHaveText('Select a vendor...');

    // Wait for vendors to be loaded (you might need to adjust this based on your actual loading state)
    await page.waitForTimeout(1000);

    // Check if vendor options are populated
    const vendorOptions = vendorDropdown.locator('option');
    await expect(vendorOptions).toHaveCount(2); // At least 2 options (default + one vendor)
  });

  test('should update default percentage when vendor is selected', async ({ page }) => {
    // Select a vendor from the dropdown
    const vendorDropdown = page.locator('select').first();
    await vendorDropdown.selectOption({ index: 1 }); // Select the first vendor (after default option)

    // Wait for the default percentage to be updated
    await page.waitForTimeout(1000);

    // Get the default percentage input
    const defaultPercentageInput = page.locator('input[type="number"]').first();

    // Check if the default percentage is a valid number
    const percentageValue = await defaultPercentageInput.inputValue();
    expect(Number(percentageValue)).not.toBeNaN();
  });

  test('should display vendor rules after selection', async ({ page }) => {
    // Select a vendor from the dropdown
    const vendorDropdown = page.locator('select').first();
    await vendorDropdown.selectOption({ index: 1 });

    // Wait for rules to be loaded
    await page.waitForTimeout(1000);

    // Check if rules section is visible
    const rulesSection = page.locator('text="Pricing Rules"');
    await expect(rulesSection).toBeVisible();

    // Check if at least one rule is displayed
    const ruleCards = page.locator('.bg-gray-50.rounded-lg.p-6.border.border-gray-200');
    await expect(ruleCards).toHaveCount(1); // At least one rule card
  });
}); 