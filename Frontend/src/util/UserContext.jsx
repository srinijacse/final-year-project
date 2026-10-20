import  { useState, useEffect, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const syncUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("userInfo", JSON.stringify(userData));
    } else {
      localStorage.removeItem("userInfo");
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await axios.get("/user/registered/getDetails");
      if (data?.data) {
        syncUser(data.data);
        return data.data;
      }
    } catch (err) {
      console.log("Could not refresh user session:", err?.message);
    }
    return null;
  };

  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem("userInfo");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem("userInfo");
        }
      }

      try {
        const { data } = await axios.get("/auth/me");
        if (data?.data) {
          syncUser(data.data);
        }
      } catch (err) {
        // If 401, clear stale storage
        if (err?.response?.status === 401) {
          syncUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post("/auth/login", { email, password },{withCredentials: true});
      syncUser(data.data.user);
      toast.success(data.message || "Welcome back to SkillSwap!");
      navigate("/dashboard");
      return { success: true, user: data.data.user };
    } catch (error) {
      const msg = error?.response?.data?.message || "Invalid credentials";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (formData) => {
    try {
      const { data } = await axios.post("/auth/register", formData, {withCredentials: true});
      syncUser(data.data.user);
      toast.success(data.message || "Account created successfully!");
      navigate("/dashboard");
      return { success: true, user: data.data.user };
    } catch (error) {
      const msg = error?.response?.data?.message || "Registration failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await axios.get("/auth/logout", {withCredentials: true});
    } catch (err) {
      console.log("Logout error:", err);
    } finally {
      syncUser(null);
      toast.info("Logged out successfully");
      navigate("/login");
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser: syncUser,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
