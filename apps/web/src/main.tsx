import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "@fontsource/press-start-2p";
import "@fontsource-variable/inter";
import "./index.css";
import { ArcadeShell } from "./components/ArcadeShell";
import { MuteToggle } from "./components/MuteToggle";
import { SoundProvider } from "./lib/audio";
import BackgroundPicker from "./pages/BackgroundPicker";
import DrawDemo from "./pages/DrawDemo";
import HostPage from "./pages/HostPage";
import PlayPage from "./pages/PlayPage";
import UiGallery from "./pages/UiGallery";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <SoundProvider>
        <ArcadeShell>
          <MuteToggle />
          <Routes>
            <Route path="/" element={<Navigate to="/host" replace />} />
            <Route path="/host" element={<HostPage />} />
            <Route path="/play/:code" element={<PlayPage />} />
            <Route path="/backgrounds" element={<BackgroundPicker />} />
            {import.meta.env.DEV ? (
              <>
                <Route path="/ui" element={<UiGallery />} />
                <Route path="/draw-demo" element={<DrawDemo />} />
              </>
            ) : null}
            <Route path="*" element={<p className="p-8 font-body">Page not found</p>} />
          </Routes>
        </ArcadeShell>
      </SoundProvider>
    </BrowserRouter>
  </StrictMode>,
);
