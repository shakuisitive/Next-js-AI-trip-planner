"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { getPlaces } from "@/actions";
import { toast } from "sonner";
import Image from "next/image";
import { format } from "date-fns";

interface Place {
  id: string;
  name: string;
  type: string;
  description: string;
  location: string;
  timeOfDay: string;
  duration: string;
  image: string | null;
  createdAt: Date;
  day: {
    dayNumber: number;
    trip: {
      id: string;
      tourName: string;
    };
  };
  restaurant: {
    cuisine: string;
    priceRange: string;
  } | null;
  attraction: {
    category: string;
  } | null;
}

type SearchField = "name" | "type" | "location" | "tripName";
type SortField = "name" | "type" | "location" | "tripName" | "timeOfDay" | "createdAt";
type SortOrder = "asc" | "desc";

export default function PlacesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("name");
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const result = await getPlaces();
        if (result.success && result.places) {
          setPlaces(result.places as unknown as Place[]);
        } else {
          toast.error("Failed to fetch places");
        }
      } catch (error) {
        toast.error("An error occurred while fetching places");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  const filteredPlaces = places.filter((place) => {
    const searchTermLower = searchTerm.toLowerCase();
    const fieldValue = searchField === "tripName" 
      ? place.day.trip.tourName.toLowerCase()
      : place[searchField]?.toLowerCase() || "";
    return fieldValue.includes(searchTermLower);
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "type":
        comparison = a.type.localeCompare(b.type);
        break;
      case "location":
        comparison = a.location.localeCompare(b.location);
        break;
      case "tripName":
        comparison = a.day.trip.tourName.localeCompare(b.day.trip.tourName);
        break;
      case "timeOfDay":
        comparison = a.timeOfDay.localeCompare(b.timeOfDay);
        break;
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Places</h1>
          <p className="text-muted-foreground">Manage attractions and restaurants</p>
        </div>
        <Link href="/dashboard/places/create">
          <Button className="bg-slate-800 hover:bg-slate-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Place
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Place Management</CardTitle>
          <CardDescription>View and manage all places</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value as SearchField)}
              className="w-[150px] h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="location">Location</option>
              <option value="tripName">Trip</option>
            </select>
            <Input
              placeholder={`Search by ${searchField}...`}
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Image</TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Name
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("type")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Type
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("tripName")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Trip
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Day</TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("location")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Location
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("timeOfDay")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Time
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Duration</TableHead>
                <TableHead className="text-center">Details</TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Created
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlaces.map((place) => (
                <TableRow key={place.id}>
                  <TableCell className="text-center">
                    {place.image ? (
                      <div className="relative w-12 h-12 mx-auto">
                        <Image
                          src={place.image}
                          alt={place.name}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{place.name}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={
                        place.type === "attraction"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }
                    >
                      {place.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{place.day.trip.tourName}</TableCell>
                  <TableCell className="text-center">Day {place.day.dayNumber}</TableCell>
                  <TableCell className="text-center">{place.location}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="capitalize">
                      {place.timeOfDay}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{place.duration}</TableCell>
                  <TableCell className="text-center">
                    {place.type === "restaurant" && place.restaurant ? (
                      <div className="space-y-1">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {place.restaurant.cuisine}
                        </Badge>
                        <div className="text-sm text-gray-500">
                          {place.restaurant.priceRange}
                        </div>
                      </div>
                    ) : place.type === "attraction" && place.attraction ? (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {place.attraction.category}
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-center">
                    {format(new Date(place.createdAt), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
