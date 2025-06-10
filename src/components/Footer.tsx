import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#1F2937] to-[#111827] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <svg
                className="w-8 h-8 text-[#2563EB]"
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
              <span className="font-bold text-xl text-white">AI Travel</span>
            </div>
            <p className="text-[#9CA3AF] mb-6">
              Your AI-powered travel companion for unforgettable adventures around the world.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-[#9CA3AF] hover:text-[#2563EB] transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#9CA3AF] hover:text-[#2563EB] transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#9CA3AF] hover:text-[#2563EB] transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-[#9CA3AF] hover:text-[#2563EB] transition-colors duration-300">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-[#9CA3AF] hover:text-[#2563EB] transition-colors duration-300">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-[#9CA3AF] hover:text-[#2563EB] transition-colors duration-300">
                  Destinations
                </a>
              </li>
              <li>
                <a href="#" className="text-[#9CA3AF] hover:text-[#2563EB] transition-colors duration-300">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <MapPin className="w-5 h-5 mr-3 text-[#2563EB]" />
                <span className="text-[#9CA3AF]">Karachi, Pakistan</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-[#2563EB]" />
                <span className="text-[#9CA3AF]">+923132307538</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-[#2563EB]" />
                <span className="text-[#9CA3AF]">shakirkhan72727@gmail.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-6 text-white">Newsletter</h3>
            <p className="text-[#9CA3AF] mb-4">
              Subscribe to our newsletter for the latest travel updates and offers.
            </p>
            <form className="flex flex-col space-y-3">
              <input
                type="email"
                placeholder="Your email"
                className="px-4 py-3 bg-[#374151] text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] placeholder-[#9CA3AF]"
              />
              <button
                type="submit"
                className="bg-[#2563EB] hover:bg-[#1E40AF] text-white px-6 py-3 rounded-xl transition-all duration-300 shadow-[0_2px_4px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_6px_rgba(37,99,235,0.35)] transform hover:-translate-y-0.5"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-[#374151] mt-12 pt-8 text-center">
          <p className="text-[#9CA3AF]">
            &copy; {new Date().getFullYear()} AI Travel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
