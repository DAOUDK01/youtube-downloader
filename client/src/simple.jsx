import React from "react";
import ReactDOM from "react-dom/client";

console.log("Simple test app loading...");

function SimpleApp() {
  console.log("SimpleApp component rendering");

  return (
    <div
      style={{
        backgroundColor: "#0a0a0a",
        color: "#e4e6eb",
        minHeight: "100vh",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Simple React App Test</h1>
      <p>If you can see this, React is working!</p>
      <p>Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}

const root = document.getElementById("root");
console.log("Root element found:", !!root);

if (root) {
  console.log("Rendering Simple App...");
  ReactDOM.createRoot(root).render(<SimpleApp />);
} else {
  console.error("Root element not found!");
}
