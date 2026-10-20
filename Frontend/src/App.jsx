
import { Route, Routes } from "react-router-dom";
import Header from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";
import LandingPage from "./Pages/LandingPage/LandingPage";
import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import AboutUs from "./Pages/AboutUs/AboutUs";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Discover from "./Pages/Discover/Discover";
import Profile from "./Pages/Profile/Profile";
import EditProfile from "./Pages/EditProfile/EditProfile";
import Connections from "./Pages/Connections/Connections";
import Chats from "./Pages/Chats/Chats";
import Sessions from "./Pages/Sessions/Sessions";
import SkillVerification from "./Pages/SkillVerification/SkillVerification";
import Notifications from "./Pages/Notifications/Notifications";
import NotFound from "./Pages/NotFound/NotFound";
import PrivateRoutes from "./util/PrivateRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ backgroundColor: "#0b1120" }}>
      <Header />
      <ToastContainer
        position="top-right"
        autoClose={3500}
        theme="dark"
        hideProgressBar={false}
      />

      <main className="flex-grow-1">
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about_us" element={<AboutUs />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/profile/:username" element={<Profile />} />

          {/* Protected User Pages */}
          <Route element={<PrivateRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/edit_profile" element={<EditProfile />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/chats" element={<Chats />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/verify" element={<SkillVerification />} />
            <Route path="/verification" element={<SkillVerification />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
