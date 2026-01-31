// src/print/PrintResumeWrapper.js
import React from "react";
import ResumePreview from "../resumepreview/ResumePreview";

/*
  HARD RULES FOR PUPPETEER:
  - .resume-print-root MUST exist on first render
  - No useEffect
  - No conditional rendering that removes root
*/

export default function PrintResumeWrapper() {
    // 🔑 CACHE BUSTER
    const params = new URLSearchParams(window.location.search);
    const printId = params.get("printId") || Date.now().toString();

    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem("resume-print-data") || "{}");
    } catch {
        saved = {};
    }

    const formData = saved.formData || {};
    const template = saved.template || "modern";

    return (
        <>
            {/* 🔒 GLOBAL PRINT RESET */}
            <style>{`
        body {
          margin: 0;
          padding: 0;
          background: white;
        }

        header,
        nav,
        .app-header,
        .sidebar,
        .builder-layout {
          display: none !important;
        }
      `}</style>

            {/* 🔑 HYBRID PRINT FLAG */}
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            if (${JSON.stringify(template)} === "hybrid") {
              document.body.classList.add("hybrid-print");
            } else {
              document.body.classList.remove("hybrid-print");
            }
          `,
                }}
            />

            {/* 🔑 ROOT — Puppeteer WAITS for this */}
            <div
                className="resume-print-root"
                data-print-id={printId}
                data-print-ready="true"
            >
                <ResumePreview
                    formData={formData}
                    template={template}
                    isFinalView={true}
                />
            </div>
        </>
    );
}
