// babel-register.js
// Load @babel/register at runtime so Node can require() .jsx templates during dev.
// Works in ESM apps by using createRequire.

import { createRequire } from "module";
const require = createRequire(import.meta.url);

try {
    // Try to initialize @babel/register (transpiles JSX on the fly for dev).
    // If presets are not installed this will throw — we catch below and warn instead of crashing.
    const babelRegister = require("@babel/register");

    babelRegister({
        // extensions we expect our templates to use
        extensions: [".js", ".jsx", ".mjs"],
        // prefer installed presets if available
        presets: [
            (() => {
                try { return require.resolve("@babel/preset-env"); } catch (e) { return null; }
            })(),
            (() => {
                try { return require.resolve("@babel/preset-react"); } catch (e) { return null; }
            })()
        ].filter(Boolean),
        // don't transpile node_modules for speed
        ignore: [/node_modules/],
        cache: false,
    });

    console.log("✅ Babel register active: JSX support enabled.");
} catch (err) {
    // Non-fatal in production if templates are precompiled.
    console.warn("⚠️ Could not initialize @babel/register — ensure templates are precompiled for production.");
    console.warn("   Reason:", err && err.message ? err.message : err);
}

// --- Stub non-JS assets so require('./style.css') or require('./image.png') doesn't crash server-side loads ---
// Note: require.extensions is deprecated in type definitions but still workably available in Node dev environments.
// We guard so this code only runs when require.extensions exists.

const assetExtensions = [
    ".css", ".scss", ".less",
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp",
    ".woff", ".woff2", ".ttf", ".eot", ".otf"
];

try {
    // only set when available (some managed Node runtimes forbid modifying require.extensions)
    if (typeof require !== "undefined" && typeof require.extensions !== "undefined") {
        assetExtensions.forEach(ext => {
            // only set if not already set
            if (!require.extensions[ext]) {
                // small stub that exports an empty string for CSS/images/fonts
                // components that import these will receive "" which is fine for server-side rendering
                require.extensions[ext] = function (module, filename) {
                    module.exports = "";
                };
            }
        });
    }
} catch (e) {
    // ignore — some environments disallow modifying require.extensions
}
