import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const API_URL = "https://6a59cb2368601fc330ea1836.mockapi.io/users";

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const register = async (fullName, email, password) => {
    try {
      // თუ შენი მეილით დარეგისტრირდები, ავტომატურად გახდები ადმინი (true), სხვებისთვის იქნება false
      const isAdmin = email === "saba.kapanadze22@gmail.com"; 
      
      const response = await axios.post(API_URL, { fullName, email, password, isAdmin });
      setUser(response.data);
      return { success: true };
    } catch (error) {
      return { success: false, message: "რეგისტრაცია ვერ მოხერხდა" };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.get(API_URL);
      const foundUser = response.data.find(
        (u) => u.email === email && u.password === password
      );

      if (foundUser) {
        setUser(foundUser);
        return { success: true };
      }
      
      return { success: false, message: "არასწორი მეილი ან პაროლი" };
    } catch (error) {
      return { success: false, message: "სერვერის შეცდომა" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);