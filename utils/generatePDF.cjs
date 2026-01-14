// utils/generatePDF.cjs
require("../babel-register");
require("ignore-styles");

const fs = require("fs");
const path = require("path");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const puppeteer = require("puppeteer");

/* =====================================================
   HELPERS
===================================================== */

function readCss(fp) {
    return fs.existsSync(fp) ? fs.readFileSync(fp, "utf8") : "";
}

function fontToDataUri(fp) {
    return `data:font/woff2;base64,${fs.readFileSync(fp).toString("base64")}`;
}

/* =====================================================
   LOAD ResumePreview (SAME COMPONENT AS FRONTEND)
===================================================== */

function loadResumePreview() {
    const file = path.join(
        __dirname,
        "..",
        "frontend",
        "src",
        "resumepreview",
        "ResumePreview.js"
    );

    if (!fs.existsSync(file)) {
        throw new Error("ResumePreview.js not found");
    }

    const mod = require(file);
    return mod.default || mod;
}

/* =====================================================
   PDF RENDERER (A4 TRUE PAGINATION)
===================================================== */

async function renderPdfBuffer({
    formData = {},
    template = "modern",
}) {
    const root = path.resolve(__dirname, "..");

    const ResumePreview = loadResumePreview();

    /* ---------- CSS (EXACT SAME AS PREVIEW) ---------- */

    const previewCss = readCss(
        path.join(root, "frontend", "src", "resumepreview", "ResumePreview.css")
    );

    const templateCss = readCss(
        path.join(
            root,
            "frontend",
            "src",
            "resumepreview",
            `${template}-template.css`
        )
    );

    const printCss = readCss(
        path.join(
            root,
            "frontend",
            "src",
            "resumepreview",
            "ResumePrint.css"
        )
    );

    /* ---------- EMBED FONTS ---------- */

    const fontsDir = path.join(root, "frontend", "public", "fonts");

    const fonts = [
        { file: "Inter-Regular.woff2", weight: 400 },
        { file: "Inter-SemiBold.woff2", weight: 600 },
        { file: "Inter-Bold.woff2", weight: 700 },
    ]
        .filter(f => fs.existsSync(path.join(fontsDir, f.file)))
        .map(
            f => `
@font-face {
  font-family: 'Inter';
  font-weight: ${f.weight};
  font-style: normal;
  src: url('${fontToDataUri(path.join(fontsDir, f.file))}') format('woff2');
}
`
        )
        .join("\n");

    /* ---------- APP ---------- */

    const App = () =>
        React.createElement(ResumePreview, {
            formData,
            template,
            isFinalView: true,
            isPdf: true, // 🔥 important
        });

    /* =====================================================
       🔥 HYBRID PRINT FIXES (CRITICAL)
       Only applied in PDF
    ===================================================== */

    const hybridPrintFix =
        template === "hybrid"
            ? `
/* ===== HYBRID PDF NORMALIZATION ===== */

.hybrid-template ul {
    list-style: disc !important;
    padding-left: 18px !important;
    margin-top: 6px;
}

.hybrid-template li {
    color: #222 !important;
    margin-bottom: 4px;
}

.hybrid-template li::marker {
    color: #222 !important;
}

.hybrid-template ul:empty {
    display: none;
}

.hybrid-template .hybrid-item {
    margin-bottom: 12px;
}
`
            : "";

    /* =====================================================
       🔥 TEMPLATE-SPECIFIC PAGE MARGIN FIX
    ===================================================== */

    const pageMargin = template === "hybrid" ? "0mm" : "12mm";

    /* ---------- HTML ---------- */

    const html = `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
${fonts}
${previewCss}
${templateCss}
${printCss}
${hybridPrintFix}

/* =================================================
   PDF NORMALIZATION
================================================= */

@page {
  size: A4;
  margin: ${pageMargin};
}

html, body {
  margin: 0;
  padding: 0;
  background: #ffffff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

:root {
  --preview-scale: 1 !important;
}

.resume-page {
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  box-shadow: none !important;
  transform: none !important;
  page-break-after: always;
}

.resume-section,
.experience-item,
.education-item,
.certification-item,
.ct-item,
.mt-entry {
  break-inside: avoid;
  page-break-inside: avoid;
}
</style>
</head>
<body>
${ReactDOMServer.renderToStaticMarkup(React.createElement(App))}
</body>
</html>
`;

    /* ---------- PUPPETEER ---------- */

    const browser = await puppeteer.launch({
        headless: "new",
    });

    try {
        const page = await browser.newPage();

        page.setDefaultNavigationTimeout(0);
        page.setDefaultTimeout(0);

        await page.setViewport({
            width: 794,
            height: 1123,
            deviceScaleFactor: 1,
        });

        await page.setContent(html, {
            waitUntil: ["domcontentloaded", "networkidle0"],
        });

        await page.evaluate(async () => {
            const images = Array.from(document.images);
            await Promise.all(
                images.map(img =>
                    img.complete
                        ? Promise.resolve()
                        : new Promise(r => {
                            img.onload = img.onerror = r;
                        })
                )
            );
        });

        await new Promise(r => setTimeout(r, 300));

        return await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
        });
    } finally {
        await browser.close();
    }
}

module.exports = { renderPdfBuffer };
