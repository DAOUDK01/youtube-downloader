import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./style.css";

console.log("main.jsx loaded");

const root = document.getElementById("root");
console.log("Root element:", root);

if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  console.log("React app rendered");
} else {
  console.error("Root element not found");
}
