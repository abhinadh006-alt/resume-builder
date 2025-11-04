// utils/generatePDF.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Handlebars from "handlebars";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generatePDF(data, templateType = "modern") {
    const templatePath = path.join(__dirname, "../templates", `template-${templateType}.html`);
    if (!fs.existsSync(templatePath)) throw new Error(`Template not found: ${templatePath}`);

    const html = fs.readFileSync(templatePath, "utf8");
    const compiled = Handlebars.compile(html);

    // ======================================================
    // 🧹 CLEAN & FLATTEN COMPLEX NESTED DATA STRUCTURES
    // ======================================================
    const safe = { ...data };

    // ✅ Flatten skills
    safe.skills = (safe.skills || []).map((s) =>
        typeof s === "string"
            ? s
            : `${s.skill || s.name || ""}${s.proficiency || s.level ? " — " + (s.proficiency || s.level) : ""}`
    );

    // ✅ Flatten certifications
    safe.certifications = (safe.certifications || []).map((c) =>
        typeof c === "string"
            ? c
            : `${c.name || ""}${c.organization ? " — " + c.organization : ""}${c.issueDate ? " (" + c.issueDate + ")" : ""
            }${c.credentialId ? " | ID: " + c.credentialId : ""}${c.description ? " — " + c.description : ""
            }`
    );

    // ✅ Flatten education
    safe.education = (safe.education || []).map((e) =>
        typeof e === "string"
            ? e
            : `${e.degree || ""}${e.school ? ", " + e.school : ""}${e.location ? " — " + e.location : ""
            }${e.start || e.end ? " (" + (e.start || "") + "–" + (e.end || "Present") + ")" : ""}${e.description ? " — " + e.description : ""
            }`
    );

    // ✅ Flatten experience
    safe.experience = (safe.experience || []).map((exp) =>
        typeof exp === "string"
            ? exp
            : `${exp.title || ""}${exp.company ? " — " + exp.company : ""}${exp.location ? " — " + exp.location : ""
            }${exp.start || exp.end ? " (" + (exp.start || "") + "–" + (exp.end || "Present") + ")" : ""}${exp.description ? " — " + exp.description : ""
            }`
    );

    // ✅ Flatten languages
    safe.languages = (safe.languages || []).map((l) =>
        typeof l === "string"
            ? l
            : `${l.language || ""}${l.proficiency || l.level ? " — " + (l.proficiency || l.level) : ""}`
    );

    // ✅ Flatten summary (fallback)
    if (typeof safe.summary === "object") {
        safe.summary = JSON.stringify(safe.summary);
    }

    // ✅ Handle plain string skills (comma-separated)
    if (typeof safe.skills === "string") {
        safe.skills = safe.skills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    // Compile the final HTML using cleaned data
    const finalHTML = compiled(safe);

    // ======================================================
    // 🧭 Launch Puppeteer (cross-platform)
    // ======================================================
    const isRender = process.env.RENDER === "true" || process.env.NODE_ENV === "production";
    const isWindows = process.platform === "win32";

    let browser;
    try {
        if (isRender) {
            // ✅ Cloud (Render/Linux)
            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });
        } else if (isWindows) {
            // ✅ Local Windows Chrome
            const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
            if (!fs.existsSync(chromePath)) {
                throw new Error(`Chrome not found at: ${chromePath}. Please verify Chrome is installed.`);
            }

            browser = await puppeteer.launch({
                headless: true,
                executablePath: chromePath,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
        }

        const page = await browser.newPage();
        await page.setContent(finalHTML, { waitUntil: "networkidle0" });

        // Save PDF
        const pdfDir = path.join(__dirname, "../public/resumes");
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

        const baseName = (safe.name || "resume").replace(/\s+/g, "_");
        const fileName = `${baseName}_${Date.now()}.pdf`;
        const filePath = path.join(pdfDir, fileName);

        await page.pdf({
            path: filePath,
            format: "A4",
            printBackground: true,
            margin: { top: "15mm", bottom: "15mm", left: "12mm", right: "12mm" },
        });

        await browser.close();
        console.log(`✅ PDF generated successfully: ${filePath}`);

        return `/resumes/${fileName}`;
    } catch (err) {
        console.error("❌ PDF generation failed:", err);
        throw new Error("Failed to generate PDF: " + err.message);
    }
}
