import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

import NavBar from "./components/NavBar";

function App() {
  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element ={<HomePage/>} /> 
        <Route path="/signup" element ={<SignUpPage/>} /> 
        <Route path="/login" element ={<LoginPage/>} /> 
      </Routes>
    </div>
  );
}

export default App;
