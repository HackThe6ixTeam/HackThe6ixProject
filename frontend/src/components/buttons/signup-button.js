import React from "react";
import Link from "next/link";

const SignupButton = () => {
  return (
    <Link href="/api/auth/signup" className="button__sign-up">
      Sign Up
    </Link>
  );
};

export default SignupButton;
