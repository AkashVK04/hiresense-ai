import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import UploadResume from "./pages/UploadResume";
import Interview from "./pages/Interview";
import Results from "./pages/Results";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadResume />} />
        <Route path="/interview" element={<Interview />} />
        <Route path="/results" element={<Results />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;