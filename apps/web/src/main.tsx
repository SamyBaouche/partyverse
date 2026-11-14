import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "@fontsource/press-start-2p";
import "@fontsource-variable/inter";
import "./index.css";
import { ArcadeShell } from "./components/ArcadeShell";
import { SettingsMenu } from "./components/SettingsMenu";
import { SoundProvider } from "./lib/audio";
import { ThemeProvider } from "./lib/theme";
import BackgroundPicker from "./pages/BackgroundPicker";
import DrawDemo from "./pages/DrawDemo";
import HostPage from "./pages/HostPage";
import ConnectFourMirrorPage from "./pages/ConnectFourMirrorPage";
import LandingPage from "./pages/LandingPage";
import PlayPage from "./pages/PlayPage";
import UiGallery from "./pages/UiGallery";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <SoundProvider>
          <ArcadeShell>
            <SettingsMenu />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/host" element={<HostPage />} />
              <Route path="/c4-phone" element={<ConnectFourMirrorPage />} />
              <Route path="/play/:code" element={<PlayPage />} />
              <Route path="/backgrounds" element={<BackgroundPicker />} />
              {import.meta.env.DEV ? (
                <>
                  <Route path="/ui" element={<UiGallery />} />
                  <Route path="/draw-demo" element={<DrawDemo />} />
                </>
              ) : null}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ArcadeShell>
        </SoundProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
