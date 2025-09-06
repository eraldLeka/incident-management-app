import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ngarko user-in dhe token-in nga localStorage kur hapet app
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    console.log("AuthProvider mount - checking localStorage");
    console.log("Stored user:", storedUser);
    console.log("Stored token:", storedToken);

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Loaded user from localStorage:", parsedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Corrupted user in localStorage:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } else {
      console.log("No user/token in localStorage");
    }
    setLoading(false);
  }, []);

  // Login: ruaj token + user
  const login = (data) => {
    console.log("Login called with:", data);

    // Ruaj token-in nga backend
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      console.log("Saved access_token to localStorage");
    } else {
      console.warn("No access_token in login data");
    }

    // Ruaj user-in
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      console.log("Saved user to localStorage:", data.user);
    } else {
      // Në rast se backend kthen vetëm user fields pa key 'user'
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      console.log("Saved user to localStorage (fallback):", data);
    }
  };

  // Logout: pastro token + user
  const logout = () => {
    console.log("Logout called");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    console.log("Cleared localStorage and user state");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook për përdorim në komponentët e tjerë
export const useAuth = () => useContext(AuthContext);
