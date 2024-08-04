// components/UserType.js
"use client";

import { Button } from "@/components/ui/button";
import { BriefcaseBusiness, Building2 } from "lucide-react";
import { useUserType } from "@/context/UserTypeContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

const UserType = () => {
  const { setUserType: setGlobalUserType } = useUserType();
  const [localUserType, setLocalUserType] = useState(null);
  const router = useRouter();

  const handleNextClick = () => {
    setGlobalUserType(localUserType);
    if (localUserType === "jobSeeker") {
      router.push("/userinfo");
    } else {
      router.push("/jobs");
    }
  };

  return (
    <div className="flex h-[80vh] w-full flex-col justify-center items-center">
      <h1 className="text-3xl font-semibold mb-8">What's your goal?</h1>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className={`flex items-center space-x-4 rounded-md border p-4 text-left h-20 w-80 ${
            localUserType === "hiringManager"
              ? "border-2 border-b-4 border-primary text-primary"
              : ""
          }`}
          onClick={() => setLocalUserType("hiringManager")}
        >
          <Building2 />
          <div className="flex-1 space-y-1">
            <p className="text-lg font-medium leading-none">
              I'm a hiring manager
            </p>
          </div>
        </Button>
        <Button
          variant="outline"
          className={`flex items-center space-x-4 rounded-md border p-4 text-left h-20 w-80 ${
            localUserType === "jobSeeker"
              ? "border-2 border-b-4 border-primary text-primary"
              : ""
          }`}
          onClick={() => setLocalUserType("jobSeeker")}
        >
          <BriefcaseBusiness />
          <div className="flex-1 space-y-1">
            <p className="text-lg font-medium leading-none">
              I'm looking for a job
            </p>
          </div>
        </Button>
      </div>
      <Button className="mt-8" onClick={handleNextClick}>
        Next
      </Button>
    </div>
  );
};

export default UserType;
