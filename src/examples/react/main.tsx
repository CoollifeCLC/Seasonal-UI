// examples/react/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import SeasonalUIDemoPage from "./SeasonalUIDemo";
import WeatherDemo from "./WeatherDemo";
import WeatherDashboard from "./WeatherDashboard";

const rootEl = document.getElementById("root")!;
createRoot(rootEl).render(
  <React.StrictMode>
    <WeatherDashboard />
  </React.StrictMode>
);
