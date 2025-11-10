// utils/generatePDF.cjs
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer-core");
const chromium = require("@sparticuz/chromium");

function tryRequire(candidatePaths = []) {
    for (const p of candidatePaths) {
        try {
            if (fs.existsSync(p) || p.includes("frontend")) {
                // attempt require; wrap so we keep original error if it fails
                const mod = require(p);
                // support default export or module itself
                return mod && (mod.default || mod);
            }
        } catch (err) {
            console.warn("require failed for", p, err.message || err);
            // continue trying other paths
        }
    }
    return null;
}

function readCss(candidatePaths = []) {
    for (const p of candidatePaths) {
        try {
            if (fs.existsSync(p)) {
                return fs.readFileSync(p, "utf8");
            }
        } catch (err) {
            console.warn("css read failed for", p, err.message || err);
        }
    }
    return "";
}

async function generatePDF(data, templateType = "modern", res = null) {
    console.log("🧾 Generating PDF using template:", templateType);

    // candidate component locations (backend-first, then frontend)
    // candidate component locations (backend-first, then frontend)
    const serverTplDir = path.join(__dirname, "../server-templates");
    const frontendTplDir = path.join(__dirname, "../frontend/src/server-templates");

    const tplName =
        templateType.charAt(0).toUpperCase() + templateType.slice(1) + "Template.jsx"; // e.g. ModernTemplate.jsx

    // Template search paths — first check backend/server-templates, then frontend/src/server-templates
    const candidateComponentPaths = [
        // --- backend/server-templates ---
        path.join(serverTplDir, tplName), // ../server-templates/ModernTemplate.jsx
        path.join(serverTplDir, tplName.replace(".jsx", ".js")), // ../server-templates/ModernTemplate.js

        // --- frontend/src/server-templates ---
        path.join(frontendTplDir, tplName), // ../frontend/src/server-templates/ModernTemplate.jsx
        path.join(frontendTplDir, tplName.replace(".jsx", ".js")), // ../frontend/src/server-templates/ModernTemplate.js
    ];



    // Try to load component (if missing, fall back to ModernTemplate if available)
    let TemplateComponent = tryRequire(candidateComponentPaths);

    // If nothing found, try to fallback to frontend ModernTemplate explicitly (existing behaviour)
    if (!TemplateComponent) {
        const fallback = tryRequire([
            path.join(frontendTplDir, "ModernTemplate.jsx"),
            path.join(frontendTplDir, "ModernTemplate.js"),
            path.join(serverTplDir, "ModernTemplate.jsx"),
            path.join(serverTplDir, "ModernTemplate.js"),
        ]);
        if (fallback) {
            console.warn("⚠️ Using fallback ModernTemplate because requested template not found:", templateType);
            TemplateComponent = fallback;
        } else {
            throw new Error("No template component found (checked: " + candidateComponentPaths.join(", ") + ").");
        }
    }

    // Candidate CSS locations (server side first, then frontend)
    const candidateCssPaths = [
        path.join(serverTplDir, "styles", `${templateType}-template.css`),
        path.join(frontendTplDir, "styles", `${templateType}-template.css`),
        // older style location fallback
        path.join(__dirname, `../server-templates/styles/${templateType}-template.css`),
        path.join(__dirname, `../frontend/src/server-templates/styles/${templateType}-template.css`),
    ];
    const css = readCss(candidateCssPaths);

    const resumeData = {
        ...data,
        experience: data.experience || [],
        education: data.education || [],
        certifications: data.certifications || [],
        skills: data.skills || [],
        languages: data.languages || [],
    };

    // Render component -> HTML
    // Pass both 'resume' and 'formData' to avoid prop-name mismatch
    // Render template in FINAL mode (no placeholders)
    const element = React.createElement(TemplateComponent, {
        resume: resumeData,
        formData: resumeData,
        isFinalView: true,
    });

    const renderedHTML = ReactDOMServer.renderToStaticMarkup(element);

    // Ensure Google font link (Inter)
    const fontsLink = `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">`;

    const finalHTML = `
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1">
        ${fontsLink}
        <style>
          ${css}
          html,body { background: #fff; }
        </style>
        <title>${(data.name || "Resume").replace(/</g, "&lt;")}</title>
      </head>
      <body>${renderedHTML}</body>
      </html>
    `;

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
            // Non-windows local fallback (attempt to launch with default chromium executable)
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
            console.warn("⚠️ fonts.ready failed:", e.message || e);
        }

        await new Promise((r) => setTimeout(r, 250));

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "15mm", bottom: "15mm", left: "12mm", right: "12mm" },
            preferCSSPageSize: true
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
        console.error("❌ PDF generation failed:", err);
        if (browser) try { await browser.close(); } catch (e) {/*ignore*/ }
        throw new Error("Failed to generate PDF: " + (err && err.message ? err.message : err));
    }
}

module.exports = { generatePDF };
