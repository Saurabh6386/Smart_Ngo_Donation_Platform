import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // You can keep this empty for now
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext"; // <--- Import this
import { ChatProvider } from "./context/ChatContext"; // <--- Import ChatProvider

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <App />
          <ToastContainer position="top-right" autoClose={3000} />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
