import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

import NavBar from "./components/NavBar";

function App() {
  return (
    <div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
      {/* Background gradient */}
			<div className='absolute inset-0 overflow-hidden'>
				<div className='absolute inset-0'>
					<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(227,18,126,0.8)_0%,rgba(86,27,58,0.8)_45%,rgba(0,0,0,0.1)_100%)]' />
			  </div>
		  </div>

      <div className='relative z-50 pt-20'>
      <NavBar />
      <Routes>
        <Route path="/" element ={<HomePage/>} /> 
        <Route path="/signup" element ={<SignUpPage/>} /> 
        <Route path="/login" element ={<LoginPage/>} /> 
      </Routes>
      </div>

    </div>
  );
}

export default App;
