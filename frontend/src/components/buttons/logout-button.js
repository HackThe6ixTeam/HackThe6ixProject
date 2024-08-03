import React from "react";
import Link from "next/link";

const LogoutButton = () => {
  return (
    <Link href="/api/auth/logout" className="button__logout">
      Log Out
    </Link>
  );
};

export default LogoutButton;
