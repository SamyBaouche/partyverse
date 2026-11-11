import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "@fontsource/press-start-2p";
import "@fontsource-variable/inter";
import "./index.css";
import { ArcadeShell } from "./components/ArcadeShell";
import HostPage from "./pages/HostPage";
import PlayPage from "./pages/PlayPage";
import UiGallery from "./pages/UiGallery";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ArcadeShell>
        <Routes>
          <Route path="/" element={<Navigate to="/host" replace />} />
          <Route path="/host" element={<HostPage />} />
          <Route path="/play/:code" element={<PlayPage />} />
          {import.meta.env.DEV ? <Route path="/ui" element={<UiGallery />} /> : null}
          <Route path="*" element={<p className="p-8 font-body">Page not found</p>} />
        </Routes>
      </ArcadeShell>
    </BrowserRouter>
  </StrictMode>,
);
