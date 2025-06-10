import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";

const destinations = [
  {
    name: "South Africa",
    image:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80",
    description: "Experience the wild beauty of the African savanna",
  },
  {
    name: "Asia",
    image:
      "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800&q=80",
    description: "Discover ancient traditions and modern wonders",
  },
  {
    name: "Italy",
    image:
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80",
    description: "Indulge in art, history, and culinary delights",
  },
  {
    name: "Thailand",
    image:
      "https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80",
    description: "Explore tropical paradise and rich culture",
  },
  {
    name: "Egypt",
    image:
      "https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=800&q=80",
    description: "Uncover the mysteries of ancient civilizations",
  },
  {
    name: "Nice & Rome",
    image:
      "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800&q=80",
    description: "Experience Mediterranean charm and history",
  },
];

const DestinationGallery = () => {
  return (
    <section className="py-24 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-[#F3F4F6] to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#2563EB] to-[#1E40AF]">
            Explore Dream Destinations
          </h2>
          <p className="text-lg md:text-xl text-[#6B7280] max-w-2xl mx-auto">
            Discover our carefully curated selection of extraordinary places
            that will inspire your next adventure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden bg-white shadow-[0_10px_25px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_25px_rgba(0,0,0,0.2)] transition-all duration-300"
            >
              <div className="relative h-80">
                <Image
                  alt={destination.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  src={destination.image}
                  width={400}
                  height={300}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F2937]/90 via-[#1F2937]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-0 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-5 h-5 text-[#F97316]" />
                  <h3 className="text-white text-2xl font-bold">
                    {destination.name}
                  </h3>
                </div>
                <p className="text-white/90 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {destination.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationGallery;
