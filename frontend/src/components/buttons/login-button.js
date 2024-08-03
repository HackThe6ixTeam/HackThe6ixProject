import React from "react";
import Link from "next/link";

const LoginButton = () => {
  return (
    <Link href="/api/auth/login" className="button__login">
      Log In
    </Link>
  );
};

export default LoginButton;
