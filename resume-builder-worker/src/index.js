export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const method = request.method.toUpperCase();

		// ✅ Common CORS headers
		const corsHeaders = {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
			"Access-Control-Allow-Headers": "Authorization, Content-Type",
		};

		// ✅ Handle OPTIONS (preflight) requests
		if (method === "OPTIONS") {
			return new Response(null, { headers: corsHeaders });
		}

		// ✅ Helper: send JSON
		const json = (obj, status = 200) =>
			new Response(JSON.stringify(obj), {
				status,
				headers: {
					...corsHeaders,
					"Content-Type": "application/json",
				},
			});

		// ✅ Generate predictable daily key
		const today = new Date().toISOString().slice(0, 10);
		const validKey = `TG-SECRET-${today.replace(/-/g, "")}`;

		// Root route
		if (url.pathname === "/") {
			return new Response("Resume Builder Backend is Live ✅", {
				headers: { "content-type": "text/plain", ...corsHeaders },
			});
		}

		// Public daily key
		if (url.pathname === "/api/daily-key") {
			return json({ key: validKey });
		}

		// Secure routes
		if (url.pathname.startsWith("/api/secure")) {
			const auth = request.headers.get("authorization");
			if (auth !== `Bearer ${validKey}`) {
				return json({ error: "Unauthorized" }, 401);
			}

			// Secure ping
			if (url.pathname === "/api/secure/ping") {
				return json({ ok: true, msg: "Secure route access granted" });
			}

			// Secure PDF generation
			if (url.pathname === "/api/secure/generate-cv" && method === "POST") {
				try {
					const body = await request.json().catch(() => ({}));

					const resumeHTML = `
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; margin: 40px; }
                  h1 { color: #0d6efd; margin-bottom: 0; }
                  h2 { font-size: 18px; margin-top: 4px; color: #555; }
                  p { line-height: 1.5; margin: 6px 0; }
                  .section { margin-top: 18px; }
                </style>
              </head>
              <body>
                <h1>${body.name || "Your Name"}</h1>
                <h2>${body.title || ""}</h2>
                <p><strong>Email:</strong> ${body.email || ""}</p>
                <p><strong>Phone:</strong> ${body.phone || ""}</p>
                <p><strong>Summary:</strong></p>
                <p>${body.summary ||
						"A passionate safety professional dedicated to workplace excellence."
						}</p>
                <div class="section">
                  <h3>Experience</h3>
                  <p>${body.experience || "Details about experience go here."}</p>
                </div>
                <div class="section">
                  <h3>Education</h3>
                  <p>${body.education || "Education details here."}</p>
                </div>
              </body>
            </html>
          `;

					const pdfResponse = await fetch("https://api.html2pdf.app/v1/generate", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							html: resumeHTML,
							apiKey: env.HTML2PDF_KEY,
						}),
					});

					const pdfBuffer = await pdfResponse.arrayBuffer();

					return new Response(pdfBuffer, {
						status: 200,
						headers: {
							...corsHeaders,
							"Content-Type": "application/pdf",
							"Content-Disposition": 'inline; filename="resume.pdf"',
						},
					});
				} catch (err) {
					return json({ ok: false, error: err.message || "PDF generation failed" }, 500);
				}
			}

			// Unknown secure route
			return json({ error: "Not found" }, 404);
		}

		// Fallback
		return json({ error: "Not found" }, 404);
	},
};
