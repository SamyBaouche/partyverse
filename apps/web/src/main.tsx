import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "./index.css";
import HostPage from "./pages/HostPage";
import PlayPage from "./pages/PlayPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/host" replace />} />
        <Route path="/host" element={<HostPage />} />
        <Route path="/play/:code" element={<PlayPage />} />
        <Route path="*" element={<p className="p-8">Page not found</p>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
