import { Inter } from "next/font/google";
import { Inter as FontSans } from "next/font/google"
import "./globals.css";
import { cn } from "@/lib/utils"
import { UserProvider } from "@auth0/nextjs-auth0/client";
import { NavBarButtons } from "../components/navbar"; // Adjust the path as necessary
import { UserTypeProvider } from "@/context/UserTypeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Verify",
  description: "Transform Recruitment with Evidence-based Candidate Profiles",
};
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <UserTypeProvider>
        <UserProvider>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            fontSans.variable
          )}
        >
            <header>
              <nav>
                <NavBarButtons />
              </nav>
            </header>
            <main>
              {children}
            </main>
          </body>
        </UserProvider>
      </UserTypeProvider>
    </html>
  );
}
