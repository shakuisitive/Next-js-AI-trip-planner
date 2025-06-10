"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignInModal from "./SignInModal";
import { useSession, signOut } from "next-auth/react";
import { useCredentials } from "@/context/CredentialsContext";
import { useCredentialsLoggedInChecker } from "@/lib/credentialsAuth/credentialsLoggedInChecker";
import { Menu, X } from "lucide-react";

const Header = () => {
  const router = useRouter();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const {
    setCredentialsLoggedInUserInfo,
    setLoggedInViaCrdentials,
    credentialsLoggedInUserInfo,
  } = useCredentials();
  const loggedInViaCredential = useCredentialsLoggedInChecker();

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const refreshHome = () => {
    window.location.href = "/";
  };

  // Function to get display name
  const getDisplayName = () => {
    if (session?.user?.name) return session.user.name;
    if (credentialsLoggedInUserInfo?.name)
      return credentialsLoggedInUserInfo.name;
    if (session?.user?.email) return session.user.email.split("@")[0];
    if (credentialsLoggedInUserInfo?.email)
      return credentialsLoggedInUserInfo.email.split("@")[0];
    return "User";
  };

  const handleSignOut = async () => {
    if (session) {
      await signOut();
    }
    setCredentialsLoggedInUserInfo(null);
    setLoggedInViaCrdentials(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md py-4 fixed w-full z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={refreshHome}
          >
            <svg
              className="w-8 h-8 text-[#2563EB] group-hover:text-[#1E40AF] transition-colors duration-300"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5Z" />
              <path d="m2 17 10 5 10-5" />
              <path d="m2 12 10 5 10-5" />
            </svg>
            <span className="text-[#2563EB] group-hover:text-[#1E40AF] font-bold text-xl transition-colors duration-300">
              TripFusion
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              className="text-[#1F2937] hover:text-[#2563EB] transition-colors duration-300 font-medium"
              onClick={() => router.push("/")}
            >
              Home
            </button>
            <button
              className="text-[#1F2937] hover:text-[#2563EB] transition-colors duration-300 font-medium"
              onClick={() => scrollToSection("about")}
            >
              About
            </button>
            <button
              className="text-[#1F2937] hover:text-[#2563EB] transition-colors duration-300 font-medium"
              onClick={() => scrollToSection("destinations")}
            >
              Destinations
            </button>
            <button
              className="text-[#1F2937] hover:text-[#2563EB] transition-colors duration-300 font-medium"
              onClick={() => scrollToSection("contact")}
            >
              Contact
            </button>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {session || loggedInViaCredential ? (
              <>
                <span className="text-[#6B7280]">
                  Hello, {getDisplayName()}
                </span>
                <button
                  onClick={handleSignOut}
                  className="bg-[#2563EB] hover:bg-[#1E40AF] text-white px-6 py-2 rounded-xl transition-all duration-300 shadow-[0_2px_4px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_6px_rgba(37,99,235,0.35)] transform hover:-translate-y-0.5"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowSignInModal(true)}
                className="bg-[#2563EB] hover:bg-[#1E40AF] text-white px-6 py-2 rounded-xl transition-all duration-300 shadow-[0_2px_4px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_6px_rgba(37,99,235,0.35)] transform hover:-translate-y-0.5"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#1F2937]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-[#E5E7EB]">
            <nav className="flex flex-col space-y-4">
              <button
                className="text-[#1F2937] hover:text-[#2563EB] transition-colors duration-300 font-medium"
                onClick={() => router.push("/")}
              >
                Home
              </button>
              <button
                className="text-[#1F2937] hover:text-[#2563EB] transition-colors duration-300 font-medium"
                onClick={() => scrollToSection("about")}
              >
                About
              </button>
              <button
                className="text-[#1F2937] hover:text-[#2563EB] transition-colors duration-300 font-medium"
                onClick={() => scrollToSection("destinations")}
              >
                Destinations
              </button>
              <button
                className="text-[#1F2937] hover:text-[#2563EB] transition-colors duration-300 font-medium"
                onClick={() => scrollToSection("contact")}
              >
                Contact
              </button>
              {session || loggedInViaCredential ? (
                <>
                  <span className="text-[#6B7280]">
                    Hello, {getDisplayName()}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-[#2563EB] hover:bg-[#1E40AF] text-white px-6 py-2 rounded-xl transition-all duration-300"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowSignInModal(true)}
                  className="bg-[#2563EB] hover:bg-[#1E40AF] text-white px-6 py-2 rounded-xl transition-all duration-300"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        )}
      </div>

      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        showAuthMessage={false}
      />
    </header>
  );
};

export default Header;
