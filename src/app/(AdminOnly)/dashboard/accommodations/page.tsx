"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search, Edit, Trash2, Star, ExternalLink, ArrowUpDown, Check, X, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { getAccommodations, updateAccommodationDetails, deleteAccommodation, updateAccommodationAmenities } from "@/actions"
import { format } from "date-fns"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Image from "next/image"

interface Accommodation {
  id: string
  name: string
  type: string
  tripId: string
  rating: number
  pricePerNight: number
  description: string
  bookingUrl: string | null
  image: string | null
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
  status: boolean | null
  trip: {
    tourName: string
  }
  amenities: {
    name: string
  }[]
}

type SearchField = "name" | "type" | "tripName"
type SortField = "name" | "type" | "tripName" | "rating" | "pricePerNight" | "createdAt" | "status"
type SortOrder = "asc" | "desc"

interface EditingAccommodation {
  id: string
  field: "name" | "type" | "pricePerNight" | "description" | "bookingUrl" | "amenities" | "rating" | "image"
  value: string | number | { name: string }[]
}

export default function AccommodationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState<SearchField>("name")
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [editingAccommodation, setEditingAccommodation] = useState<EditingAccommodation | null>(null)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [tempAmenities, setTempAmenities] = useState<string>("")

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const result = await getAccommodations()
        if (result.success && result.accommodations) {
          setAccommodations(result.accommodations as unknown as Accommodation[])
        } else {
          toast.error("Failed to fetch accommodations")
        }
      } catch (error) {
        toast.error("An error occurred while fetching accommodations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAccommodations()
  }, [])

  const filteredAccommodations = accommodations.filter((accommodation) => {
    const searchTermLower = searchTerm.toLowerCase()
    const fieldValue = searchField === "tripName" 
      ? accommodation.trip.tourName.toLowerCase()
      : accommodation[searchField]?.toLowerCase() || ""
    return fieldValue.includes(searchTermLower)
  })

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const sortedAccommodations = [...filteredAccommodations].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name)
        break
      case "type":
        comparison = a.type.localeCompare(b.type)
        break
      case "tripName":
        comparison = a.trip.tourName.localeCompare(b.trip.tourName)
        break
      case "rating":
        comparison = a.rating - b.rating
        break
      case "pricePerNight":
        comparison = a.pricePerNight - b.pricePerNight
        break
      case "status":
        comparison = (a.status ?? true) === (b.status ?? true) ? 0 : (a.status ?? true) ? 1 : -1
        break
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

  const handleStartEditing = (
    accommodationId: string,
    field: "name" | "type" | "pricePerNight" | "description" | "bookingUrl" | "amenities" | "rating" | "image",
    currentValue: string | number | { name: string }[]
  ) => {
    setEditingAccommodation(null)
    setIsEditModalOpen(false)
    setTempAmenities("")

    if (field === "amenities") {
      setTempAmenities((currentValue as { name: string }[]).map(a => a.name).join(", "))
      setEditingAccommodation({ id: accommodationId, field, value: currentValue })
      setIsEditModalOpen(true)
    } else if (field === "description" || field === "image" || field === "rating") {
      setEditingAccommodation({ id: accommodationId, field, value: currentValue })
      setIsEditModalOpen(true)
    } else {
      setEditingAccommodation({ id: accommodationId, field, value: currentValue })
    }
  }

  const handleCancelEditing = () => {
    setEditingAccommodation(null)
    setIsEditModalOpen(false)
    setTempAmenities("")
  }

  const handleSaveEdit = async () => {
    if (!editingAccommodation) return

    setIsUpdating(editingAccommodation.id)
    try {
      if (editingAccommodation.field === "amenities") {
        const amenities = tempAmenities.split(",").map((item) => item.trim())
        const result = await updateAccommodationAmenities(editingAccommodation.id, amenities)
        
        if (result.success && result.accommodation) {
          setAccommodations(
            accommodations.map((accommodation) =>
              accommodation.id === editingAccommodation.id
                ? result.accommodation as Accommodation
                : accommodation
            )
          )
          toast.success("Amenities updated successfully")
          setEditingAccommodation(null)
          setIsEditModalOpen(false)
          setTempAmenities("")
        } else {
          toast.error("Failed to update amenities")
        }
      } else {
        const updates: any = {}
        updates[editingAccommodation.field] = editingAccommodation.value

        const result = await updateAccommodationDetails(editingAccommodation.id, updates)

        if (result.success && result.accommodation) {
          setAccommodations(
            accommodations.map((accommodation) =>
              accommodation.id === editingAccommodation.id
                ? result.accommodation as Accommodation
                : accommodation
            )
          )
          toast.success("Accommodation updated successfully")
          setEditingAccommodation(null)
          setIsEditModalOpen(false)
          setTempAmenities("")
        } else {
          toast.error("Failed to update accommodation")
        }
      }
    } catch (error) {
      toast.error("An error occurred while updating")
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDeleteAccommodation = async (accommodationId: string) => {
    setIsDeleting(accommodationId)
    try {
      const result = await deleteAccommodation(accommodationId)
      if (result.success) {
        setAccommodations(
          accommodations.map((accommodation) =>
            accommodation.id === accommodationId
              ? { ...accommodation, status: false, deletedAt: new Date() }
              : accommodation
          )
        )
        toast.success("Accommodation deleted successfully")
      } else {
        toast.error("Failed to delete accommodation")
      }
    } catch (error) {
      toast.error("An error occurred while deleting")
    } finally {
      setIsDeleting(null)
    }
  }

  const handleStatusToggle = async (accommodationId: string, newStatus: boolean) => {
    setIsUpdating(accommodationId)
    try {
      const result = await updateAccommodationDetails(accommodationId, { status: newStatus })
      if (result.success && result.accommodation) {
        setAccommodations(
          accommodations.map((accommodation) =>
            accommodation.id === accommodationId
              ? result.accommodation as Accommodation
              : accommodation
          )
        )
        toast.success(
          newStatus
            ? "Accommodation activated successfully"
            : "Accommodation deactivated successfully"
        )
      } else {
        toast.error("Failed to update accommodation status")
      }
    } catch (error) {
      toast.error("An error occurred while updating status")
    } finally {
      setIsUpdating(null)
    }
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    return (
      <div className="flex items-center">
        {Array.from({ length: fullStars }, (_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <Star className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />}
        <span className="ml-1 text-sm">({rating})</span>
      </div>
    )
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accommodations</h1>
          <p className="text-muted-foreground">Manage hotels, inns, and other accommodations</p>
        </div>
        <Link href="/dashboard/accommodations/create">
          <Button className="bg-slate-800 hover:bg-slate-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Accommodation
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Accommodation Management</CardTitle>
          <CardDescription>View and manage all accommodation options</CardDescription>
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
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("rating")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Rating
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("pricePerNight")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Price/Night
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">Description</TableHead>
                <TableHead className="text-center">Amenities</TableHead>
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
              {sortedAccommodations.map((accommodation) => (
                <TableRow key={accommodation.id}>
                  <TableCell className="text-center">
                    {accommodation.image ? (
                      <div 
                        className="relative w-12 h-12 mx-auto cursor-pointer hover:bg-slate-50 transition-colors rounded-md group"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!editingAccommodation) {
                            handleStartEditing(accommodation.id, "image", accommodation.image || "");
                          }
                        }}
                      >
                        <Image
                          src={accommodation.image}
                          alt={accommodation.name}
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
                          if (!editingAccommodation) {
                            handleStartEditing(accommodation.id, "image", "");
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
                      if (!editingAccommodation) {
                        handleStartEditing(accommodation.id, "name", accommodation.name);
                      }
                    }}
                  >
                    {editingAccommodation?.id === accommodation.id &&
                    editingAccommodation.field === "name" ? (
                      <div className="flex items-center justify-center gap-2 h-8">
                        <Input
                          value={editingAccommodation.value as string}
                          onChange={(e) =>
                            setEditingAccommodation({
                              ...editingAccommodation,
                              value: e.target.value,
                            })
                          }
                          className="w-[200px] h-8"
                          disabled={isUpdating === accommodation.id}
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
                            disabled={isUpdating === accommodation.id}
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
                            disabled={isUpdating === accommodation.id}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-8">
                        <span className="text-sm">{accommodation.name}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {accommodation.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{accommodation.trip.tourName}</TableCell>
                  <TableCell className="text-center">
                    <div 
                      className="cursor-pointer hover:bg-slate-50 transition-colors p-2 rounded-md group"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!editingAccommodation) {
                          handleStartEditing(accommodation.id, "rating", accommodation.rating);
                        }
                      }}
                    >
                      {renderStars(accommodation.rating)}
                    </div>
                  </TableCell>
                  <TableCell
                    className="text-center cursor-pointer hover:bg-slate-50 transition-colors group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!editingAccommodation) {
                        handleStartEditing(accommodation.id, "pricePerNight", accommodation.pricePerNight);
                      }
                    }}
                  >
                    {editingAccommodation?.id === accommodation.id &&
                    editingAccommodation.field === "pricePerNight" ? (
                      <div className="flex items-center justify-center gap-2 h-8">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            value={editingAccommodation.value as number}
                            onChange={(e) =>
                              setEditingAccommodation({
                                ...editingAccommodation,
                                value: Number(e.target.value),
                              })
                            }
                            className="w-[120px] h-8 pl-7"
                            disabled={isUpdating === accommodation.id}
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                            disabled={isUpdating === accommodation.id}
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
                            disabled={isUpdating === accommodation.id}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-8">
                        <span className="text-sm">${accommodation.pricePerNight}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell 
                    className="text-center max-w-xs cursor-pointer hover:bg-slate-50 transition-colors group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!editingAccommodation) {
                        handleStartEditing(accommodation.id, "description", accommodation.description);
                      }
                    }}
                  >
                    {editingAccommodation?.id === accommodation.id &&
                    editingAccommodation.field === "description" ? (
                      <div className="flex items-center justify-center gap-2 h-8">
                        <Input
                          value={editingAccommodation.value as string}
                          onChange={(e) =>
                            setEditingAccommodation({
                              ...editingAccommodation,
                              value: e.target.value,
                            })
                          }
                          className="w-[300px] h-8"
                          disabled={isUpdating === accommodation.id}
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
                            disabled={isUpdating === accommodation.id}
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
                            disabled={isUpdating === accommodation.id}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="truncate">{accommodation.description}</div>
                    )}
                  </TableCell>
                  <TableCell 
                    className="text-center cursor-pointer hover:bg-slate-50 transition-colors group"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!editingAccommodation) {
                        handleStartEditing(accommodation.id, "amenities", accommodation.amenities);
                      }
                    }}
                  >
                    <div className="flex flex-wrap gap-1 justify-center max-h-8 overflow-hidden">
                      {accommodation.amenities.slice(0, 2).map((amenity) => (
                        <Badge key={amenity.name} variant="secondary" className="bg-green-100 text-green-800">
                          {amenity.name}
                        </Badge>
                      ))}
                      {accommodation.amenities.length > 2 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          +{accommodation.amenities.length - 2}
                        </Badge>
                      )}
                      <Edit className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    {accommodation.amenities.length > 2 && (
                      <div className="hidden group-hover:block absolute z-10 mt-2 p-2 bg-white border rounded-md shadow-lg">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {accommodation.amenities.map((amenity) => (
                            <Badge key={amenity.name} variant="secondary" className="bg-green-100 text-green-800">
                              {amenity.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Switch
                        checked={accommodation.status ?? true}
                        onCheckedChange={(checked) =>
                          handleStatusToggle(accommodation.id, checked)
                        }
                        disabled={isUpdating === accommodation.id}
                        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                      />
                      <span className="text-sm">
                        {accommodation.status ?? true ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {format(new Date(accommodation.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {accommodation.bookingUrl ? (
                        <DropdownMenuItem asChild>
                          <a href={accommodation.bookingUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Booking
                          </a>
                        </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem disabled>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            No Booking URL
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/accommodations/${accommodation.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteAccommodation(accommodation.id)}
                          className="text-red-600"
                          disabled={isDeleting === accommodation.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeleting === accommodation.id ? "Deleting..." : "Delete"}
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
              {editingAccommodation?.field === "amenities" 
                ? "Edit Amenities" 
                : editingAccommodation?.field === "description"
                ? "Edit Description"
                : editingAccommodation?.field === "image"
                ? "Edit Image URL"
                : "Edit Rating"}
            </DialogTitle>
            <DialogDescription>
              {editingAccommodation?.field === "amenities"
                ? "Enter amenities separated by commas"
                : editingAccommodation?.field === "description"
                ? "Enter a detailed description"
                : editingAccommodation?.field === "image"
                ? "Enter the image URL"
                : "Select a rating from 1 to 5"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingAccommodation?.field === "amenities" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Amenities</label>
                <Input
                  value={tempAmenities}
                  onChange={(e) => setTempAmenities(e.target.value)}
                  placeholder="WiFi, Pool, Spa, Restaurant"
                  className="w-full"
                />
              </div>
            ) : editingAccommodation?.field === "description" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={editingAccommodation.value as string}
                  onChange={(e) =>
                    setEditingAccommodation({
                      ...editingAccommodation,
                      value: e.target.value,
                    })
                  }
                  placeholder="Enter accommodation description"
                  className="w-full"
                />
              </div>
            ) : editingAccommodation?.field === "image" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={editingAccommodation.value as string}
                  onChange={(e) =>
                    setEditingAccommodation({
                      ...editingAccommodation,
                      value: e.target.value,
                    })
                  }
                  placeholder="Enter image URL"
                  className="w-full"
                />
                {editingAccommodation.value && (
                  <div className="relative w-full h-48 mt-2">
                    <Image
                      src={editingAccommodation.value as string}
                      alt="Preview"
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                )}
              </div>
            ) : editingAccommodation?.field === "rating" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={editingAccommodation.value === rating ? "default" : "outline"}
                      onClick={() =>
                        setEditingAccommodation({
                          ...editingAccommodation,
                          value: rating,
                        })
                      }
                      className={`w-10 h-10 p-0 ${
                        editingAccommodation.value === rating 
                          ? "bg-blue-600 text-white hover:bg-blue-700" 
                          : "hover:bg-slate-100"
                      }`}
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center justify-center mt-2">
                  {renderStars(editingAccommodation.value as number)}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false)
                setEditingAccommodation(null)
              }}
              className="text-gray-900"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isUpdating === editingAccommodation?.id}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isUpdating === editingAccommodation?.id ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
