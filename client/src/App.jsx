import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LoginPage from './components/loginpage/LoginPage';
import SignupPage from './components/signuppage/SignupPage';
import MainPage from './components/mainpage/MainPage';
import Portal from './components/appointmentpage/Portal';
import AppointmentPage from './components/appointmentpage/AppointmentPage';
import AdminPortal from './components/admin/AdminPortal';
import AdminLogin from './components/admin/AdminLogin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/appointment" element={<AppointmentPage />} />
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin-portal' element={<AdminPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
