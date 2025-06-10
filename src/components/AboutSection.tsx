import Image from "next/image";
import { Check, Globe, Sparkles, Shield, Clock, Star } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F3F4F6]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#1E40AF]">
            Your AI-Powered Travel Companion
          </h2>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-3xl mx-auto">
            Experience the perfect blend of artificial intelligence and human
            expertise to create unforgettable journeys tailored just for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="relative w-full h-[600px]">
              <div className="absolute inset-0 flex flex-col items-center md:block">
                <Image
                  alt="Modern city skyline"
                  className="w-72 h-56 object-cover rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] z-10 md:absolute md:top-0 md:left-0 transform hover:scale-105 transition-transform duration-300"
                  src="https://images.unsplash.com/photo-1498307833015-e7b400441eb8?w=800&q=80"
                  width={288}
                  height={224}
                />
                <Image
                  alt="Cultural experience"
                  className="w-72 h-56 object-cover rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] z-20 md:absolute md:top-1/4 md:left-1/4 md:transform md:rotate-6 mt-6 md:mt-0 hover:scale-105 transition-transform duration-300"
                  src="https://images.unsplash.com/photo-1452022582947-b521d8779ab6?w=800&q=80"
                  width={288}
                  height={224}
                />
                <Image
                  alt="Natural landscape"
                  className="w-72 h-56 object-cover rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] z-30 md:absolute md:bottom-0 md:right-0 md:transform md:-rotate-6 mt-6 md:mt-0 hover:scale-105 transition-transform duration-300"
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80"
                  width={288}
                  height={224}
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_25px_rgba(0,0,0,0.2)] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-[#2563EB]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-2">
                  Global Coverage
                </h3>
                <p className="text-[#6B7280]">
                  Access destinations worldwide with detailed local insights and
                  recommendations
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_25px_rgba(0,0,0,0.2)] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-[#F97316]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-2">
                  AI-Powered Planning
                </h3>
                <p className="text-[#6B7280]">
                  Smart algorithms create personalized itineraries based on your
                  preferences
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_25px_rgba(0,0,0,0.2)] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#059669]/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-[#059669]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-2">
                  Secure & Reliable
                </h3>
                <p className="text-[#6B7280]">
                  Your data is protected with enterprise-grade security measures
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_25px_rgba(0,0,0,0.2)] transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center mb-4">
                  <Star className="w-6 h-6 text-[#7C3AED]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1F2937] mb-2">
                  Premium Features
                </h3>
                <p className="text-[#6B7280]">
                  Exclusive access to special deals and premium travel
                  experiences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
