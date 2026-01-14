// scripts/renameCompiledToCjs.js
// Renames compiled template files from .js → .cjs
// Ensures Node can require() them even when package.json uses "type": "module"

const fs = require("fs");
const path = require("path");

const dir = path.resolve(process.cwd(), "server", "templates-compiled");

if (!fs.existsSync(dir)) {
    console.warn("renameCompiledToCjs: directory not found:", dir);
    process.exit(0);
}

for (const file of fs.readdirSync(dir)) {
    if (file.endsWith(".js")) {
        const from = path.join(dir, file);
        const to = path.join(dir, file.replace(/\.js$/, ".cjs"));

        // Avoid overwriting existing .cjs
        if (!fs.existsSync(to)) {
            console.log(`Renaming ${file} → ${path.basename(to)}`);
            fs.renameSync(from, to);
        } else {
            console.log(`Skipped (already exists): ${path.basename(to)}`);
        }
    }
}

console.log("renameCompiledToCjs: done.");
