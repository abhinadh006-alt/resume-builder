// scripts/testRender.js
require('ignore-styles'); // ensure CSS imports are ignored
const { renderPdfBuffer } = require('../utils/generatePDF.cjs'); // adjust path if needed

(async () => {
    try {
        const buf = await renderPdfBuffer({ formData: { name: 'Test User' }, template: 'modern' });
        require('fs').writeFileSync('out-test.pdf', buf);
        console.log('Wrote out-test.pdf (size:', buf.length, ')');
    } catch (e) {
        console.error('testRender error:', e);
        process.exit(1);
    }
})();
