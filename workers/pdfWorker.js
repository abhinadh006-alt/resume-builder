import puppeteer from "puppeteer";
import { Pool } from "pg";

const pool = new Pool({
    connectionString: process.env.SUPABASE_DB_URL,
});

console.log("🖨️ PDF worker running");

setInterval(async () => {
    const { rows } = await pool.query(
        "SELECT * FROM pdf_jobs WHERE status='pending' LIMIT 1 FOR UPDATE SKIP LOCKED"
    );

    if (!rows.length) return;

    const job = rows[0];

    try {
        await pool.query(
            "UPDATE pdf_jobs SET status='processing' WHERE id=$1",
            [job.id]
        );

        // generate PDF here
        const pdfUrl = "https://example.com/resume.pdf";

        await pool.query(
            "UPDATE pdf_jobs SET status='done', result_url=$1 WHERE id=$2",
            [pdfUrl, job.id]
        );
    } catch (err) {
        await pool.query(
            "UPDATE pdf_jobs SET status='failed', error=$1 WHERE id=$2",
            [err.message, job.id]
        );
    }
}, 2000);
