export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const method = request.method.toUpperCase();

		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Authorization, Content-Type",
		};

		if (method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		const json = (obj, status = 200) =>
			new Response(JSON.stringify(obj), {
				status,
				headers: { ...corsHeaders, "Content-Type": "application/json" },
			});

		const now = new Date();
		const yyyy = now.getFullYear();
		const mm = String(now.getMonth() + 1).padStart(2, "0");
		const basePart = `${mm}06${yyyy}D11D`.replace(/[^\d]/g, "");
		const random4 = Math.floor(1000 + Math.random() * 9000);
		const validKey = `TG-SECRET-${basePart}${random4}`;

		// root
		if (url.pathname === "/") {
			return new Response("Resume Builder Backend is Live ✅", {
				headers: { "content-type": "text/plain", ...corsHeaders },
			});
		}

		if (url.pathname === "/api/daily-key") {
			return json({ key: validKey });
		}

		if (url.pathname.startsWith("/api/secure")) {
			const auth = request.headers.get("authorization");
			const todayPattern = `${mm}06${yyyy}D11D`.replace(/[^\d]/g, "");
			if (!auth?.startsWith(`Bearer TG-SECRET-${todayPattern}`)) {
				return json({ error: "Unauthorized" }, 401);
			}

			if (url.pathname === "/api/secure/ping") {
				return json({ ok: true, msg: "Secure route access granted" });
			}

			if (url.pathname === "/api/secure/generate-cv" && method === "POST") {
				try {
					const body = await request.json().catch(() => ({}));

					const formatList = (arr, fields = []) =>
						Array.isArray(arr)
							? arr
								.map((item) =>
									fields
										.map((f) => item[f])
										.filter(Boolean)
										.join(" — ")
								)
								.join("<br/>")
							: "";

					const expHTML = formatList(body.experience, ["title", "company", "description"]);
					const eduHTML = formatList(body.education, ["degree", "school", "year"]);
					const certHTML = formatList(body.certifications, ["name", "issuer"]);
					const skillHTML = Array.isArray(body.skills) ? body.skills.join(", ") : "";
					const langHTML = Array.isArray(body.languages) ? body.languages.join(", ") : "";

					const resumeHTML = `
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; color: #222; }
      h1 { color: #0d6efd; margin-bottom: 0; }
      h2 { font-size: 18px; margin-top: 4px; color: #555; }
      h3 { color: #0d6efd; margin-top: 18px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
      p { line-height: 1.5; margin: 6px 0; }
      .section { margin-top: 18px; }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(body.name || "Your Name")}</h1>
    <h2>${escapeHtml(body.title || "")}</h2>
    <p><strong>Email:</strong> ${escapeHtml(body.email || "")}</p>
    <p><strong>Phone:</strong> ${escapeHtml(body.phone || "")}</p>
    <p><strong>Location:</strong> ${escapeHtml(body.location || "")}</p>
    <p><strong>Website:</strong> ${escapeHtml(body.website || "")}</p>

    <div class="section">
      <h3>Summary</h3>
      <p>${escapeHtml(body.summary || "")}</p>
    </div>

    <div class="section">
      <h3>Experience</h3>
      <p>${expHTML || "—"}</p>
    </div>

    <div class="section">
      <h3>Education</h3>
      <p>${eduHTML || "—"}</p>
    </div>

    <div class="section">
      <h3>Certifications</h3>
      <p>${certHTML || "—"}</p>
    </div>

    <div class="section">
      <h3>Skills</h3>
      <p>${skillHTML || "—"}</p>
    </div>

    <div class="section">
      <h3>Languages</h3>
      <p>${langHTML || "—"}</p>
    </div>
  </body>
</html>
`;

					// Use env.HTML2PDF_KEY, set in Cloudflare dashboard (Workers > your worker > Variables)
					const pdfResponse = await fetch("https://api.html2pdf.app/v1/generate", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ html: resumeHTML, apiKey: env.HTML2PDF_KEY }),
					});

					if (!pdfResponse.ok) {
						const errText = await pdfResponse.text();
						return json({ ok: false, error: "PDF service error", details: errText }, 500);
					}

					const pdfBuffer = await pdfResponse.arrayBuffer();
					return new Response(pdfBuffer, {
						status: 200,
						headers: { ...corsHeaders, "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="resume.pdf"' },
					});
				} catch (err) {
					return json({ ok: false, error: err.message || "PDF generation failed" }, 500);
				}
			}

			return json({ error: "Not found" }, 404);
		}

		return json({ error: "Not found" }, 404);
	},
};

function escapeHtml(str) {
	return String(str)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}
