// babel-register.js
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// ✅ Load Babel Register in CommonJS mode
require("@babel/register")({
    presets: ["@babel/preset-env", "@babel/preset-react"],
    extensions: [".js", ".jsx"],
    ignore: [/node_modules/],
    cache: false,
});

console.log("✅ Babel register active: JSX support enabled.");
