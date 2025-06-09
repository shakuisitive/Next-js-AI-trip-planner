"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, Search, Edit, Trash2, ExternalLink, ArrowUpDown, Check, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { getPlaces, updatePlaceDetails, deletePlace } from "@/actions";
import { format } from "date-fns";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface Place {
  id: string;
  name: string;
  type: "attraction" | "restaurant";
  description: string;
  location: string;
  timeOfDay: string;
  duration: string;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  status: boolean | null;
  day: {
    dayNumber: number;
    trip: {
      id: string;
      tourName: string;
    };
  };
  restaurant?: {
    cuisine: string;
    priceRange: string;
  };
  attraction?: {
    category: string;
  };
}

type SearchField = "name" | "type" | "location" | "tripName";
type SortField = "name" | "type" | "location" | "tripName" | "timeOfDay" | "duration" | "createdAt" | "status";
type SortOrder = "asc" | "desc";

interface EditingPlace {
  id: string;
  field: "name" | "type" | "description" | "location" | "timeOfDay" | "duration" | "image" | "dayNumber" | "cuisine" | "priceRange" | "category";
  value: string | number;
}

export default function PlacesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("name");
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [editingPlace, setEditingPlace] = useState<EditingPlace | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      case "duration":
        comparison = a.duration.localeCompare(b.duration);
        break;
      case "status":
        comparison = (a.status ?? true) === (b.status ?? true) ? 0 : (a.status ?? true) ? 1 : -1;
        break;
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleStartEditing = (
    placeId: string,
    field: "name" | "type" | "description" | "location" | "timeOfDay" | "duration" | "image" | "dayNumber" | "cuisine" | "priceRange" | "category",
    currentValue: string | number
  ) => {
    setEditingPlace(null);
    setIsEditModalOpen(false);

    if (field === "description" || field === "image") {
      setEditingPlace({ id: placeId, field, value: currentValue });
      setIsEditModalOpen(true);
    } else {
      setEditingPlace({ id: placeId, field, value: currentValue });
    }
  };

  const handleCancelEditing = () => {
    setEditingPlace(null);
    setIsEditModalOpen(false);
  };

  const handleSaveEdit = async () => {
    if (!editingPlace) return;

    setIsUpdating(editingPlace.id);
    try {
      const updates: any = {};
      updates[editingPlace.field] = editingPlace.value;

      const result = await updatePlaceDetails(editingPlace.id, updates);

      if (result.success && result.place) {
        setPlaces(
          places.map((place) =>
            place.id === editingPlace.id
              ? result.place as Place
              : place
          )
        );
        toast.success("Place updated successfully");
        setEditingPlace(null);
        setIsEditModalOpen(false);
      } else {
        toast.error("Failed to update place");
      }
    } catch (error) {
      toast.error("An error occurred while updating");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeletePlace = async (placeId: string) => {
    setIsDeleting(placeId);
    try {
      const result = await deletePlace(placeId);
      if (result.success) {
        setPlaces(
          places.map((place) =>
            place.id === placeId
              ? { ...place, status: false, deletedAt: new Date() }
              : place
          )
        );
        toast.success("Place deleted successfully");
      } else {
        toast.error("Failed to delete place");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleStatusToggle = async (placeId: string, newStatus: boolean) => {
    setIsUpdating(placeId);
    try {
      const result = await updatePlaceDetails(placeId, { status: newStatus });
      if (result.success && result.place) {
        setPlaces(
          places.map((place) =>
            place.id === placeId
              ? result.place as Place
              : place
          )
        );
        toast.success(
          newStatus
            ? "Place activated successfully"
            : "Place deactivated successfully"
        );
      } else {
        toast.error("Failed to update place status");
      }
    } catch (error) {
      toast.error("An error occurred while updating status");
    } finally {
      setIsUpdating(null);
    }
  };

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
            <Select
              value={searchField}
              onValueChange={(value: SearchField) => setSearchField(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="location">Location</SelectItem>
                <SelectItem value="tripName">Trip</SelectItem>
              </SelectContent>
            </Select>
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
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("duration")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Duration
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Description</TableHead>
                <TableHead className="text-center">Details</TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Status
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
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
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlaces.map((place) => (
                <TableRow key={place.id}>
                  <TableCell className="text-center">
                    {place.image ? (
                      <div 
                        className="relative w-12 h-12 mx-auto cursor-pointer hover:bg-slate-50 transition-colors rounded-md group"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!editingPlace) {
                            handleStartEditing(place.id, "image", place.image || "");
                          }
                        }}
                      >
                        <Image
                          src={place.image}
                          alt={place.name}
                          fill
                          className="object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-md flex items-center justify-center">
                          <Edit className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="w-12 h-12 mx-auto bg-gray-100 rounded-md flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!editingPlace) {
                            handleStartEditing(place.id, "image", "");
                          }
                        }}
                      >
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-center cursor-pointer hover:bg-slate-50 transition-colors group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!editingPlace) {
                        handleStartEditing(place.id, "name", place.name);
                      }
                    }}
                  >
                    {editingPlace?.id === place.id &&
                    editingPlace.field === "name" ? (
                      <div className="flex items-center justify-center gap-2 h-8">
                        <Input
                          value={editingPlace.value as string}
                          onChange={(e) =>
                            setEditingPlace({
                              ...editingPlace,
                              value: e.target.value,
                            })
                          }
                          className="w-[200px] h-8"
                          disabled={isUpdating === place.id}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                            disabled={isUpdating === place.id}
                            className="h-7 w-7 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditing();
                            }}
                            disabled={isUpdating === place.id}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-8">
                        <span className="text-sm">{place.name}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {place.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{place.day.trip.tourName}</TableCell>
                  <TableCell
                    className="text-center cursor-pointer hover:bg-slate-50 transition-colors group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!editingPlace) {
                        handleStartEditing(place.id, "dayNumber", place.day.dayNumber);
                      }
                    }}
                  >
                    {editingPlace?.id === place.id &&
                    editingPlace.field === "dayNumber" ? (
                      <div className="flex items-center justify-center gap-2 h-8">
                        <Input
                          type="number"
                          value={editingPlace.value as number}
                          onChange={(e) =>
                            setEditingPlace({
                              ...editingPlace,
                              value: Number(e.target.value),
                            })
                          }
                          className="w-[80px] h-8"
                          disabled={isUpdating === place.id}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                            disabled={isUpdating === place.id}
                            className="h-7 w-7 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditing();
                            }}
                            disabled={isUpdating === place.id}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-8">
                        <span className="text-sm">Day {place.day.dayNumber}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-center cursor-pointer hover:bg-slate-50 transition-colors group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!editingPlace) {
                        handleStartEditing(place.id, "location", place.location);
                      }
                    }}
                  >
                    {editingPlace?.id === place.id &&
                    editingPlace.field === "location" ? (
                      <div className="flex items-center justify-center gap-2 h-8">
                        <Input
                          value={editingPlace.value as string}
                          onChange={(e) =>
                            setEditingPlace({
                              ...editingPlace,
                              value: e.target.value,
                            })
                          }
                          className="w-[200px] h-8"
                          disabled={isUpdating === place.id}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                            disabled={isUpdating === place.id}
                            className="h-7 w-7 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditing();
                            }}
                            disabled={isUpdating === place.id}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-8">
                        <span className="text-sm">{place.location}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-center cursor-pointer hover:bg-slate-50 transition-colors group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!editingPlace) {
                        handleStartEditing(place.id, "timeOfDay", place.timeOfDay);
                      }
                    }}
                  >
                    {editingPlace?.id === place.id &&
                    editingPlace.field === "timeOfDay" ? (
                      <div className="flex items-center justify-center gap-2 h-8">
                        <Input
                          value={editingPlace.value as string}
                          onChange={(e) =>
                            setEditingPlace({
                              ...editingPlace,
                              value: e.target.value,
                            })
                          }
                          className="w-[120px] h-8"
                          disabled={isUpdating === place.id}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                            disabled={isUpdating === place.id}
                            className="h-7 w-7 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditing();
                            }}
                            disabled={isUpdating === place.id}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-8">
                        <span className="text-sm">{place.timeOfDay}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-center cursor-pointer hover:bg-slate-50 transition-colors group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!editingPlace) {
                        handleStartEditing(place.id, "duration", place.duration);
                      }
                    }}
                  >
                    {editingPlace?.id === place.id &&
                    editingPlace.field === "duration" ? (
                      <div className="flex items-center justify-center gap-2 h-8">
                        <Input
                          value={editingPlace.value as string}
                          onChange={(e) =>
                            setEditingPlace({
                              ...editingPlace,
                              value: e.target.value,
                            })
                          }
                          className="w-[120px] h-8"
                          disabled={isUpdating === place.id}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                            disabled={isUpdating === place.id}
                            className="h-7 w-7 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditing();
                            }}
                            disabled={isUpdating === place.id}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-8">
                        <span className="text-sm">{place.duration}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell 
                    className="text-center max-w-xs cursor-pointer hover:bg-slate-50 transition-colors group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!editingPlace) {
                        handleStartEditing(place.id, "description", place.description);
                      }
                    }}
                  >
                    {editingPlace?.id === place.id &&
                    editingPlace.field === "description" ? (
                      <div className="flex items-center justify-center gap-2 h-8">
                        <Input
                          value={editingPlace.value as string}
                          onChange={(e) =>
                            setEditingPlace({
                              ...editingPlace,
                              value: e.target.value,
                            })
                          }
                          className="w-[300px] h-8"
                          disabled={isUpdating === place.id}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                            disabled={isUpdating === place.id}
                            className="h-7 w-7 p-0"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditing();
                            }}
                            disabled={isUpdating === place.id}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="truncate">{place.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {place.type === "restaurant" ? (
                      <div className="flex flex-col gap-1">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {place.restaurant?.cuisine}
                        </Badge>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {place.restaurant?.priceRange}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {place.attraction?.category}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Switch
                        checked={place.status ?? true}
                        onCheckedChange={(checked) =>
                          handleStatusToggle(place.id, checked)
                        }
                        disabled={isUpdating === place.id}
                        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                      />
                      <span className="text-sm">
                        {place.status ?? true ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {format(new Date(place.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/places/${place.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePlace(place.id)}
                          className="text-red-600"
                          disabled={isDeleting === place.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeleting === place.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog 
        open={isEditModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            handleCancelEditing()
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPlace?.field === "description"
                ? "Edit Description"
                : "Edit Image URL"}
            </DialogTitle>
            <DialogDescription>
              {editingPlace?.field === "description"
                ? "Enter a detailed description"
                : "Enter the image URL"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingPlace?.field === "description" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={editingPlace.value as string}
                  onChange={(e) =>
                    setEditingPlace({
                      ...editingPlace,
                      value: e.target.value,
                    })
                  }
                  placeholder="Enter place description"
                  className="w-full"
                />
              </div>
            ) : editingPlace?.field === "image" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={editingPlace.value as string}
                  onChange={(e) =>
                    setEditingPlace({
                      ...editingPlace,
                      value: e.target.value,
                    })
                  }
                  placeholder="Enter image URL"
                  className="w-full"
                />
                {editingPlace.value && (
                  <div className="relative w-full h-48 mt-2">
                    <Image
                      src={editingPlace.value as string}
                      alt="Preview"
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                )}
              </div>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingPlace(null)
              }}
              className="text-gray-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isUpdating === editingPlace?.id}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isUpdating === editingPlace?.id ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
