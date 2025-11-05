import React from "react";
import ReactDOM from "react-dom/client";
import AllPage from "./AllPage.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { LoginProvider } from "./components/Login/LoginContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID } from "./contextes/UrlContext";
import { DeviseProvider } from "./contextes/DeviseContext.jsx";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider
        clientId={
          GOOGLE_CLIENT_ID ||
          "1093500093970-2dhfjmrv80v20l0rt0itas7duh9appse.apps.googleusercontent.com"
        }
      >
        <LoginProvider>
          <DeviseProvider>
            <AllPage />
          </DeviseProvider>
        </LoginProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
