// utils/generatePDF.js
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generatePDF(data, templateType = "modern") {
    const templatePath = path.join(__dirname, "../templates", `template-${templateType}.html`);
    if (!fs.existsSync(templatePath)) throw new Error(`Template not found: ${templatePath}`);

    const html = fs.readFileSync(templatePath, "utf8");
    const compiled = Handlebars.compile(html);

    const safe = { ...data };
    if (typeof safe.skills === "string") {
        safe.skills = safe.skills.split(",").map(s => s.trim()).filter(Boolean);
    }

    const finalHTML = compiled(safe);

    // ✅ Works on Render (uses @sparticuz/chromium)
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(finalHTML, { waitUntil: "networkidle0" });

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
    return `/resumes/${fileName}`;
}
