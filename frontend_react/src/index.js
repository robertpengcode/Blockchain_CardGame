import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { CreateBattle, Battle, Home } from "./page";
//import { OnboardModal } from "./components";
import { GlobalContextProvider } from "./context";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <GlobalContextProvider>
      {/* <OnboardModal /> */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/battle/:battleId" element={<Battle />} />
        <Route path="/create-battle" element={<CreateBattle />} />
      </Routes>
    </GlobalContextProvider>
  </BrowserRouter>
);
