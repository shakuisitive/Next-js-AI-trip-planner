import { motion } from "framer-motion";
import { Star, ExternalLink } from "lucide-react";
import Image from "next/image";
import { Accommodation } from "@/types";

interface AccommodationCardProps {
  accommodation: Accommodation;
  category: "Best Overall" | "Best Reviews" | "Best Value" | "Most Popular";
}

const AccommodationCard: React.FC<AccommodationCardProps> = ({
  accommodation,
  category,
}) => {
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Best Overall":
        return "bg-[#059669] text-white";
      case "Best Reviews":
        return "bg-[#2563EB] text-white";
      case "Best Value":
        return "bg-[#F97316] text-white";
      case "Most Popular":
        return "bg-[#7C3AED] text-white";
      default:
        return "bg-[#6B7280] text-white";
    }
  };

  const handleClick = () => {
    if (accommodation.bookingUrl) {
      window.open(accommodation.bookingUrl, "_blank");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] overflow-hidden cursor-pointer hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)] transition-shadow duration-300 w-full"
      onClick={handleClick}
    >
      <div className="relative w-full aspect-[4/3]">
        <Image
          src={accommodation.image as string}
          alt={accommodation.name}
          layout="fill"
          objectFit="cover"
          className="object-center"
        />
        <div
          className={`absolute top-2 left-2 ${getCategoryColor(
            category
          )} px-2 py-1 rounded-full text-xs font-semibold shadow-sm`}
        >
          {category}
        </div>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-bold text-[#1F2937] line-clamp-1">
            {accommodation.name}
          </h3>
          <div className="flex items-center bg-[#2563EB] text-white px-1.5 py-0.5 rounded text-xs whitespace-nowrap">
            <Star className="w-3 h-3 mr-0.5" />
            {accommodation.rating}
          </div>
        </div>
        <p className="text-xs text-[#6B7280] mt-1">{accommodation.type}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {accommodation.amenities?.slice(0, 2).map((amenity, index) => (
            <span key={index} className="text-xs text-[#6B7280]">
              • {amenity}
            </span>
          ))}
        </div>
        <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#E5E7EB]">
          <button className="text-xs text-[#2563EB] hover:text-[#1E40AF] flex items-center transition-colors duration-200">
            View Deal <ExternalLink className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AccommodationCard;
