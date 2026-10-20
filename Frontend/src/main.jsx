import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router } from "react-router-dom";
import axios from "axios";
import { UserContextProvider } from "./util/UserContext.jsx";
import { SocketProvider } from "./util/SocketContext.jsx";

// Configure Axios Defaults
axios.defaults.baseURL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:8000";
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <UserContextProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </UserContextProvider>
  </Router>
);
