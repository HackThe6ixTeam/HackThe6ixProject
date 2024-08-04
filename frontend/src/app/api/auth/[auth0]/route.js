import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

export const GET = handleAuth({
  login: handleLogin({
    returnTo: "/userType", // URL to redirect to after login
    authorizationParams: {
      type: "jobSeeker",
    },
  }),
  signup: handleLogin({
    authorizationParams: {
      screen_hint: "signup", // Directs users to the signup page
      type: "jobSeeker",
    },
    returnTo: "/userType", // URL to redirect to after signup
  }),
});
