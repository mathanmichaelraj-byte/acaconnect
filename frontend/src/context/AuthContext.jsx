import { createContext, useState, useCallback } from "react";

export const AuthContext = createContext();

function isTokenValid(token) {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function getStoredUser() {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user && isTokenValid(token)) {
      return user;
    }
    // Invalid or expired — clean up
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);

  const login = useCallback((token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // Replace history so back button can't return to protected pages
    window.history.replaceState(null, '', '/login');
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
