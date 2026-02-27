import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Signin from "./pages/Signin";

import CareerQuiz from "./components/CareerQuiz";
//import Chat from "./components/Chat";

//import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Signin />} />
        <Route path="/questions" element={<CareerQuiz />} />
        {/* <Route path="/chat" element={<Chat />} /> */}
      </Routes>
    </Router>
  );
}

export default App;