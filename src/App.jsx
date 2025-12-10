import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Test from "./pages/Test";
import Results from "./pages/Results";
import Feedback from "./pages/Feedback";


export default function App() {
  return (
    <Router>
      <div className="font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test" element={<Test />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}
