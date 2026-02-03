// Playwright script to test Credit Card Account Creation
// Usage: Run this in a Playwright environment or using the MCP tool

const run = async (page) => {
  try {
    console.log('Starting test...');
    await page.goto('http://localhost:5173/accounts');
    await page.waitForTimeout(2000);

    // Login if needed
    if (page.url().includes('login')) {
         console.log('Logging in...');
         await page.fill('input[type="email"]', 'admin@example.com');
         await page.fill('input[type="password"]', 'admin123');
         await page.click('button[type="submit"]');
         await page.waitForTimeout(2000);
         await page.goto('http://localhost:5173/accounts');
    }

    // Open Modal
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const target = btns.find(b => b.innerText.includes('Nova Conta'));
        if (target) target.click();
    });
    
    // Fill Name
    const nameInput = page.locator('input[placeholder*="Nubank"]');
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill('Nubank Platinum');
    
    // Click Credit Card Button (Robust via JS)
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('form button'));
        const target = btns.find(b => b.innerText.includes('Cartão de Crédito'));
        if (target) target.click();
    });

    // Wait for Limit field
    const limitLabel = page.getByText('Limite do cartão');
    await limitLabel.waitFor({ state: 'visible', timeout: 5000 });

    // Use .last() to get the innermost container for inputs
    await page.locator('div').filter({ has: limitLabel }).last().locator('input').fill('8500,00');

    const closingLabel = page.getByText('Dia de fechamento');
    await page.locator('div').filter({ has: closingLabel }).last().locator('select').selectOption('10');

    const dueLabel = page.getByText('Dia de vencimento');
    await page.locator('div').filter({ has: dueLabel }).last().locator('select').selectOption('20');
    
    console.log('Submitting form...');
    const [response] = await Promise.all([
        page.waitForResponse(resp => resp.url().includes('/api/accounts')),
        page.click('button[type="submit"]')
    ]);

    console.log('Response status:', response.status());
    const body = await response.text();
    console.log('Body:', body);

    if (response.status() === 201) {
        console.log('SUCCESS: Account created!');
        return { success: true };
    }
    return { success: false, status: response.status(), body };

  } catch (e) {
    console.error('FAIL:', e);
    return { error: e.message };
  }
};
