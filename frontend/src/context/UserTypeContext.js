"use client";

import { createContext, useState, useContext } from "react";

const UserTypeContext = createContext();

export const UserTypeProvider = ({ children }) => {
  const [userType, setUserType] = useState(null);
  const [devpost, setDevpost] = useState(null);
  const [github, setGithub] = useState(null);
  const [linkedin, setLinkedin] = useState(null);

  return (
    <UserTypeContext.Provider 
      value={{ userType, setUserType, devpost, setDevpost, github, setGithub, linkedin, setLinkedin }}
    >
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = () => useContext(UserTypeContext);
