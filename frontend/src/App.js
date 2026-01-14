// src/App.js
import React from "react";
import ResumeBuilder from "./ResumeBuilder";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppHeader from "./components/AppHeader";

function App() {
  return (
    <div>
      <AppHeader />
      <ResumeBuilder />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
