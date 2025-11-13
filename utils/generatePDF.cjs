// utils/generatePDF.cjs
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

/**
 * Robust PDF generator:
 * - finds template component in backend/frontend paths
 * - reads CSS from frontend or server template directories
 * - searches for local fonts (woff2) and base64-embeds them if found
 * - falls back to Google Fonts link if fonts not available locally
 * - renders component with isFinalView: true (no placeholders)
 * - generates PDF using puppeteer
 */

function tryRequire(candidatePaths = []) {
    for (const p of candidatePaths) {
        try {
            if (!p) continue;
            if (fs.existsSync(p) || p.includes("frontend")) {
                const mod = require(p);
                return mod && (mod.default || mod);
            }
        } catch (err) {
            console.warn("require failed for", p, err && err.message ? err.message : err);
        }
    }
    return null;
}

function readCss(candidatePaths = []) {
    for (const p of candidatePaths) {
        try {
            if (!p) continue;
            if (fs.existsSync(p)) {
                return fs.readFileSync(p, "utf8");
            }
        } catch (err) {
            console.warn("css read failed for", p, err && err.message ? err.message : err);
        }
    }
    return "";
}

function findFirstExisting(paths = []) {
    for (const p of paths) {
        try {
            if (p && fs.existsSync(p)) return p;
        } catch (e) { }
    }
    return null;
}

function loadFontAsDataUrl(fontPath) {
    try {
        const buf = fs.readFileSync(fontPath);
        const b64 = buf.toString("base64");
        return `data:font/woff2;base64,${b64}`;
    } catch (e) {
        return null;
    }
}

async function generatePDF(data, templateType = "modern", res = null) {
    console.log("🧾 Generating PDF using template:", templateType);

    const serverTplDir = path.join(__dirname, "../server-templates");
    const frontendTplDir = path.join(__dirname, "../frontend/src/server-templates");

    const tplName = templateType.charAt(0).toUpperCase() + templateType.slice(1) + "Template.jsx"; // e.g. ModernTemplate.jsx


    // candidate component locations (try several likely paths)
    const candidateComponentPaths = [
        // server-side templates (preferred)
        path.join(serverTplDir, tplName),
        path.join(serverTplDir, tplName.replace(".jsx", ".js")),
        // frontend dev layout (plural & singular folder names)
        path.join(frontendTplDir, tplName),
        path.join(frontendTplDir, tplName.replace(".jsx", ".js")),
        path.join(__dirname, "../frontend/src/server-templates", tplName),
        path.join(__dirname, "../frontend/src/server-templates", tplName.replace(".jsx", ".js")),
        // sometimes repo uses singular folder name "server-template"
        path.join(__dirname, "../frontend/src/server-template", tplName),
        path.join(__dirname, "../frontend/src/server-template", tplName.replace(".jsx", ".js")),
        // alternate src locations
        path.join(__dirname, "../src/server-templates", tplName),
        path.join(__dirname, "../src/server-templates", tplName.replace(".jsx", ".js")),
    ];

    // Candidate CSS locations (try frontend build main.css first, then template css in several places)
    const candidateCssPaths = [
        path.join(__dirname, "../frontend/build/static/css/main.css"),
        // scan for any main.*.css (this will be attempted later if exact not found)
        path.join(__dirname, "../frontend/build/static/css"),
        path.join(__dirname, "../frontend/src/server-templates", `${templateType}-template.css`),
        path.join(__dirname, "../frontend/src/server-template", `${templateType}-template.css`), // singular
        path.join(serverTplDir, `${templateType}-template.css`),
        path.join(__dirname, `../server-templates/${templateType}-template.css`),
        path.join(__dirname, `../frontend/src/server-templates/${templateType}-template.css`),
    ];


    // readCss uses exact paths; handle simple wildcard fallback by scanning folder
    let css = readCss(candidateCssPaths);
    if (!css) {
        // attempt scanning frontend build css dir for any main.*.css if build exists
        const maybeFrontBuildCssDir = path.join(__dirname, "../frontend/build/static/css");
        try {
            if (fs.existsSync(maybeFrontBuildCssDir)) {
                const files = fs.readdirSync(maybeFrontBuildCssDir).filter(f => f.endsWith(".css"));
                if (files.length) {
                    const p = path.join(maybeFrontBuildCssDir, files[0]);
                    css = fs.readFileSync(p, "utf8");
                    console.log("📄 Using frontend build css:", p);
                }
            }
        } catch (e) {
            // continue
        }
    }

    const resumeData = {
        ...data,
        experience: data.experience || [],
        education: data.education || [],
        certifications: data.certifications || [],
        skills: data.skills || [],
        languages: data.languages || [],
    };

    // ---------- FONT detection & embedding ----------
    // Try several likely font locations (frontend public, backend public)
    const candidateFontPaths = [
        path.join(__dirname, "../frontend/public/fonts/Inter-Regular.woff2"),
        path.join(__dirname, "../frontend/public/fonts/Inter-Regular.woff"),
        path.join(__dirname, "../public/fonts/Inter-Regular.woff2"),
        path.join(__dirname, "../public/fonts/Inter-Regular.woff"),
        path.join(process.cwd(), "frontend/public/fonts/Inter-Regular.woff2"),
        path.join(process.cwd(), "public/fonts/Inter-Regular.woff2"),
    ];

    // helper to map weight filename variants
    function mkFontPaths(basePaths, weightFilename) {
        const r = [];
        basePaths.forEach(bp => r.push(path.join(path.dirname(bp), weightFilename)));
        return r;
    }

    const fontBases = [
        path.join(__dirname, "../frontend/public/fonts"),
        path.join(__dirname, "../public/fonts"),
        path.join(process.cwd(), "frontend/public/fonts"),
        path.join(process.cwd(), "public/fonts"),
    ];

    const wantedFonts = [
        { file: "Inter-Regular.woff2", weight: 400 },
        { file: "Inter-SemiBold.woff2", weight: 600 },
        { file: "Inter-Bold.woff2", weight: 700 },
        // alternate names
        { file: "Inter-Regular.woff", weight: 400 },
        { file: "Inter-SemiBold.woff", weight: 600 },
        { file: "Inter-Bold.woff", weight: 700 },
    ];

    let fontData = {};
    for (const f of wantedFonts) {
        let found = null;
        for (const base of fontBases) {
            const candidate = path.join(base, f.file);
            if (fs.existsSync(candidate)) {
                found = candidate;
                break;
            }
        }
        if (found) {
            const dataUrl = loadFontAsDataUrl(found);
            if (dataUrl) fontData[f.weight] = dataUrl;
        }
    }

    // Build inline font-face CSS (embed local fonts if available)
    let inlineFontCss = "";
    if (fontData[400] || fontData[600] || fontData[700]) {
        console.log("🔤 Embedding local fonts into HTML for Puppeteer.");
        // prefer specific weights; if missing some, only include available ones
        if (fontData[400]) {
            inlineFontCss += `@font-face{font-family: "Inter"; font-style: normal; font-weight: 400; src: url("${fontData[400]}") format("woff2"); font-display: swap;}\n`;
        }
        if (fontData[600]) {
            inlineFontCss += `@font-face{font-family: "Inter"; font-style: normal; font-weight: 600; src: url("${fontData[600]}") format("woff2"); font-display: swap;}\n`;
        }
        if (fontData[700]) {
            inlineFontCss += `@font-face{font-family: "Inter"; font-style: normal; font-weight: 700; src: url("${fontData[700]}") format("woff2"); font-display: swap;}\n`;
        }
    } else {
        // No local fonts found — fall back to Google fonts link (best-effort)
        inlineFontCss = "";
    }

    // External fonts link (fallback)
    const externalFontsLink = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">`;

    // ---------- Render component -> HTML (final view) ----------
    const element = React.createElement(TemplateComponent, {
        resume: resumeData,
        formData: resumeData,
        isFinalView: true // force final view for server-side PDF
    });

    const renderedHTML = ReactDOMServer.renderToStaticMarkup(element);

    // Build final HTML head/styles (embed fonts CSS before app CSS)
    const finalHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1">
  ${!inlineFontCss ? externalFontsLink : ""}
  <style>
    ${inlineFontCss}
    ${css}
    html,body { background: #fff; }
  </style>
  <title>${(data.name || "Resume").replace(/</g, "&lt;")}</title>
</head>
<body>${renderedHTML}</body>
</html>`;

    // optional debug snapshot write (inspect in browser)
    try {
        const tmpDir = path.join(__dirname, "../tmp");
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        fs.writeFileSync(path.join(tmpDir, "last-snapshot.html"), finalHTML, "utf8");
        console.log("DEBUG: wrote tmp/last-snapshot.html");
    } catch (e) {
        console.warn("Could not write tmp snapshot:", e && e.message ? e.message : e);
    }

    // Puppeteer / Chromium launch logic (works for Render, Windows local, etc.)
    const isRender = process.env.RENDER === "true" || process.env.NODE_ENV === "production";
    const isWindows = process.platform === "win32";

    let browser;
    try {
        if (isRender) {
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });
        } else if (isWindows) {
            const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
            if (!fs.existsSync(chromePath)) {
                throw new Error(`Chrome not found at: ${chromePath}`);
            }
            browser = await puppeteer.launch({
                headless: true,
                executablePath: chromePath,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
        } else {
            browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
        }

        const page = await browser.newPage();
        await page.setContent(finalHTML, { waitUntil: "networkidle0" });

        try {
            await page.evaluate(async () => {
                if (document.fonts && document.fonts.ready) {
                    await document.fonts.ready;
                }
            });
        } catch (e) {
            console.warn("⚠️ fonts.ready failed:", e && e.message ? e.message : e);
        }

        // small extra wait to avoid race conditions on painting
        await new Promise((r) => setTimeout(r, 1500));

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "15mm", bottom: "15mm", left: "12mm", right: "12mm" },
            preferCSSPageSize: true,
        });

        await browser.close();

        if (res) {
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `inline; filename="${(data.name || 'resume').replace(/\s+/g, '_')}.pdf"`);
            return res.send(pdfBuffer);
        }

        const pdfDir = path.join(__dirname, "../public/resumes");
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
        const baseName = (data.name || "resume").replace(/\s+/g, "_");
        const filePath = path.join(pdfDir, `${baseName}_${Date.now()}.pdf`);
        fs.writeFileSync(filePath, pdfBuffer);
        console.log("✅ PDF generated:", filePath);
        return `/resumes/${path.basename(filePath)}`;
    } catch (err) {
        console.error("❌ PDF generation failed:", err && err.message ? err.message : err);
        if (browser) try { await browser.close(); } catch (e) { /* ignore */ }
        throw new Error("Failed to generate PDF: " + (err && err.message ? err.message : err));
    }
}

module.exports = { generatePDF };
