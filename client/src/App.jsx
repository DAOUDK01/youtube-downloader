import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Policies from "./pages/Policies";
import About from "./pages/About";
import Contact from "./pages/Contact";

console.log("App.jsx loaded");

export default function App() {
  console.log("App component rendering");

  return (
    <BrowserRouter>
      <div
        style={{ minHeight: "100vh", background: "#0a0a0a", color: "#e4e6eb" }}
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="policies" element={<Policies />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
