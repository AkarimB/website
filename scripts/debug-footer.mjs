import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto('https://server.islam.ms/fr', { waitUntil: 'domcontentloaded' });

const footerInfo = await page.$eval('.footer', el => {
    const style = window.getComputedStyle(el);
    return {
        border: style.border,
        borderWidth: style.borderWidth,
        borderStyle: style.borderStyle,
        borderColor: style.borderColor,
        display: style.display,
        padding: style.padding,
        margin: style.margin,
    };
});
console.log('Footer computed style:', JSON.stringify(footerInfo, null, 2));

// Check what the production site looks like
const prodPage = await browser.newPage();
try {
    await prodPage.goto('https://www.islam.ms/fr', { waitUntil: 'domcontentloaded', timeout: 15000 });
    const prodFooter = await prodPage.$eval('.footer', el => {
        const style = window.getComputedStyle(el);
        return {
            border: style.border,
            borderWidth: style.borderWidth,
            borderStyle: style.borderStyle,
        };
    }).catch(() => 'no .footer found');
    console.log('Production footer style:', JSON.stringify(prodFooter, null, 2));
} catch (e) {
    console.log('Production site error:', e.message);
}

// Also check the CSS rule that applies
const cssRule = await page.evaluate(() => {
    for (const sheet of document.styleSheets) {
        try {
            for (const rule of sheet.cssRules) {
                if (rule.selectorText && rule.selectorText.includes('.footer')) {
                    return { selector: rule.selectorText, cssText: rule.cssText.substring(0, 200) };
                }
            }
        } catch (e) {}
    }
    return 'no rule found';
});
console.log('CSS rule for .footer:', JSON.stringify(cssRule, null, 2));

await browser.close();
