const pdf = await page.pdf({
    printBackground: true,
    preferCSSPageSize: true, // ✅ MUST BE TRUE
    margin: { top: 0, bottom: 0, left: 0, right: 0 }
});
