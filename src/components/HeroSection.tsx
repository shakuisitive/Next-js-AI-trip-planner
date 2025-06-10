import Image from "next/image";
import TravelPlannerForm from "./TravelPlannerForm";
import mountainImage from "@/images/mountain_image.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[calc(100vh-80px)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB] to-[#1E40AF]" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 pt-16 md:pt-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 text-center -mt-16 sm:-mt-24 md:-mt-32 lg:-mt-44">
          Let AI Plan Your Next Adventure
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl mb-10 sm:mb-12 md:mb-14 text-center max-w-4xl text-white/90">
          Discover Amazing Places with Personalized Itineraries
        </p>
        <div className="w-full max-w-6xl mx-auto -mt-4 sm:-mt-6 md:-mt-8">
          <TravelPlannerForm />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
