// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ResumeBuilder from "./ResumeBuilder";
import PrintResumeWrapper from "./print/PrintResumeWrapper";
import AppHeader from "./components/AppHeader";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ===============================
            PRINT ROUTE (PUPPETEER ONLY)
            - NO HEADER
            - NO SIDEBAR
            - NO APP LAYOUT
        =============================== */}
        <Route path="/print/resume" element={<PrintResumeWrapper />} />

        {/* ===============================
            MAIN APPLICATION
        =============================== */}
        <Route
          path="/"
          element={
            <>
              <AppHeader />
              <ResumeBuilder />
            </>
          }
        />

        {/* OPTIONAL: fallback to main app */}
        <Route
          path="*"
          element={
            <>
              <AppHeader />
              <ResumeBuilder />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
