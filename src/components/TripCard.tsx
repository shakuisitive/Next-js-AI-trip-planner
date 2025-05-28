import { Calendar, MapPin, Clock, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface TripCardProps {
  trip: {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    duration: number;
    travelers: number;
    imageUrl?: string;
  };
}

const TripCard = ({ trip }: TripCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative h-48 bg-gradient-to-r from-purple-500 to-pink-500">
        {trip.imageUrl ? (
          <img
            src={trip.imageUrl}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
            {trip.destination.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{trip.title}</h3>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-5 h-5 mr-2 text-purple-500" />
            <span>{trip.destination}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-2 text-purple-500" />
            <span>
              {new Date(trip.startDate).toLocaleDateString()} -{" "}
              {new Date(trip.endDate).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2 text-purple-500" />
            <span>{trip.duration} days</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Users className="w-5 h-5 mr-2 text-purple-500" />
            <span>{trip.travelers} travelers</span>
          </div>
        </div>

        <Link
          href={`/trips/${trip.id}`}
          className="inline-flex items-center justify-center w-full px-4 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors group"
        >
          View Details
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
};

export default TripCard; 