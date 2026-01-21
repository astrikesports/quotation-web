import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Quotation from "./pages/Quotation";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quotation" element={<Quotation />} />
      </Routes>
    </BrowserRouter>
  );
}
