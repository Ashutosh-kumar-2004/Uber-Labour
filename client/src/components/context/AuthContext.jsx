import React, { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, setToken, clearUser } from "../../redux/slices/userSlice.jsx";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const login = (userData) => {
    setUserState(userData.user);
    localStorage.setItem("user", JSON.stringify(userData.user));

    /* Store token in Redux — no longer in localStorage */
    if (userData.token) {
      dispatch(setToken(userData.token));
    }
    dispatch(setUser(userData.user));
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem("user");
    dispatch(clearUser());
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;

