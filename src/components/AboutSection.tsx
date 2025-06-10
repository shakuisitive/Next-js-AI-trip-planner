import Image from "next/image";
import { Check } from "lucide-react";

const AboutSection = () => {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
        <div className="w-full md:w-2/5 mb-12 md:mb-0">
          <div className="relative w-full h-[500px] md:h-96">
            <div className="absolute inset-0 flex flex-col items-center md:block">
              <Image
                alt="Colorful coastal town"
                className="w-64 h-48 object-cover rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] z-10 md:absolute md:top-0 md:left-0"
                src="https://images.unsplash.com/photo-1498307833015-e7b400441eb8?w=800&q=80"
                width={256}
                height={192}
              />
              <Image
                alt="Person with camel in desert"
                className="w-64 h-48 object-cover rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] z-20 md:absolute md:top-1/4 md:left-1/4 md:transform md:rotate-6 mt-4 md:mt-0"
                src="https://images.unsplash.com/photo-1452022582947-b521d8779ab6?w=800&q=80"
                width={256}
                height={192}
              />
              <Image
                alt="Traveler looking at mountain landscape"
                className="w-64 h-48 object-cover rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] z-30 md:absolute md:bottom-0 md:right-0 md:transform md:-rotate-6 mt-4 md:mt-0"
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80"
                width={256}
                height={192}
              />
            </div>
          </div>
        </div>
        <div className="md:w-3/5 md:pl-16">
          <h2 className="text-4xl font-bold mb-6 text-[#1F2937]">
            Discover the World with TripFusion AI
          </h2>
          <p className="text-[#6B7280] mb-8 text-lg">
            At TripFusion AI, we believe that travel is more than just visiting
            new places. It&apos;s about creating unforgettable experiences,
            broadening your horizons, and connecting with diverse cultures
            around the globe.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center mr-3">
                <Check className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-[#1F2937]">Expertly curated travel itineraries</span>
            </li>
            <li className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center mr-3">
                <Check className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-[#1F2937]">Personalized experiences for every traveler</span>
            </li>
            <li className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center mr-3">
                <Check className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-[#1F2937]">24/7 support throughout your journey</span>
            </li>
            <li className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center mr-3">
                <Check className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-[#1F2937]">Sustainable and responsible travel options</span>
            </li>
            <li className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center mr-3">
                <Check className="w-5 h-5 text-[#2563EB]" />
              </div>
              <span className="text-[#1F2937]">Exclusive deals with trusted partners</span>
            </li>
          </ul>
          <button className="mt-8 bg-[#F97316] hover:bg-[#EA580C] text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-300 shadow-[0_2px_4px_rgba(37,99,235,0.25)]">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
