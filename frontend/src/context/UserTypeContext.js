// contexts/UserTypeContext.js
"use client";

import { createContext, useState, useContext } from "react";

const UserTypeContext = createContext();

export const UserTypeProvider = ({ children }) => {
  const [userType, setUserType] = useState(null);

  return (
    <UserTypeContext.Provider value={{ userType, setUserType }}>
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = () => useContext(UserTypeContext);
