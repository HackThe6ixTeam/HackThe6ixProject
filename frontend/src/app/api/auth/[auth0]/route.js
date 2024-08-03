import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

export const GET = handleAuth({
  login: handleLogin({
    returnTo: "/profile", // URL to redirect to after login
  }),
  signup: handleLogin({
    authorizationParams: {
      screen_hint: "signup", // Directs users to the signup page
    },
    returnTo: "/profile", // URL to redirect to after signup
  }),
});
