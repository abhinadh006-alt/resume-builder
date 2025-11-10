// scan-css.js
const fs = require('fs');
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');

if (process.argv.length < 3) {
    console.error('Usage: node scan-css.js styles.css');
    process.exit(1);
}
const css = fs.readFileSync(process.argv[2], 'utf8');

postcss.parse(css).walkRules(rule => {
    const loc = rule.source.start;
    // print line, selector text
    console.log(`${loc.line}:${loc.column}  ${rule.selector}`);
});
