import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import CategoryPage from "./pages/CategoryPage";

import NavBar from "./components/NavBar";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useUserStore } from "./stores/useUserStore";
import LoadingSpinner from "./components/LoadingSpinner";
import AdminPage from "./pages/AdminPage";

function App() {
  const {user, checkAuth, checkingAuth} = useUserStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if(checkingAuth) return <LoadingSpinner />

  return (
    <div className='min-h-screen bg-gray-900 text-white relative overflow-hidden'>
      {/* Background gradient */}
			<div className='absolute inset-0 h-screen overflow-hidden'>
				<div className='absolute inset-0'>
					<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(237, 47, 145, 0.8)_0%,rgba(86,27,58,0.8)_45%,rgba(0,0,0,0.1)_100%)]' />
			  </div>
		  </div>

      {/* Content */}
      <div className='relative z-50 pt-20'>
      <NavBar />
      <Routes>
        <Route path="/" element ={<HomePage/>} /> 
        <Route path="/signup" element ={!user ? <SignUpPage/> : <Navigate to ="/"/>} /> 
        <Route path="/login" element ={!user? <LoginPage/> : <Navigate to ="/"/>} /> 
        <Route path="/secret-dashboard" element ={user?.role === "admin" ? <AdminPage/> : <Navigate to ="/login"/>} /> 
        <Route path="/category/:category" element ={ <CategoryPage/>} />
      </Routes>
      </div>

    <Toaster/>
    </div>
  );
}

export default App;
