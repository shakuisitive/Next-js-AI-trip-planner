"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search, Edit, Trash2, Star, ExternalLink } from "lucide-react"
import Link from "next/link"

// Mock data
const accommodations = [
  {
    id: "1",
    name: "Hotel Luxe Paris",
    type: "Hotel",
    tripName: "Paris Adventure",
    rating: 4.8,
    pricePerNight: 250,
    description: "Luxury hotel in the heart of Paris with stunning city views",
    bookingUrl: "https://booking.com/hotel-luxe-paris",
    amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Tokyo Central Inn",
    type: "Inn",
    tripName: "Tokyo Explorer",
    rating: 4.5,
    pricePerNight: 180,
    description: "Traditional Japanese inn with modern amenities",
    bookingUrl: "https://booking.com/tokyo-central-inn",
    amenities: ["WiFi", "Traditional Bath", "Restaurant"],
    createdAt: "2024-01-18",
  },
  {
    id: "3",
    name: "London Bridge Hostel",
    type: "Hostel",
    tripName: "London Getaway",
    rating: 4.2,
    pricePerNight: 85,
    description: "Budget-friendly hostel near London Bridge",
    bookingUrl: "https://booking.com/london-bridge-hostel",
    amenities: ["WiFi", "Kitchen", "Lounge"],
    createdAt: "2024-01-20",
  },
]

export default function AccommodationsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAccommodations = accommodations.filter(
    (accommodation) =>
      accommodation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accommodation.tripName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteAccommodation = async (accommodationId: string) => {
    console.log("Soft deleting accommodation:", accommodationId)
    // Implement soft delete logic
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accommodations</h1>
          <p className="text-muted-foreground">Manage hotels, inns, and other accommodations</p>
        </div>
        <Link href="/admin/accommodations/create">
          <Button>
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
            <Input
              placeholder="Search accommodations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Trip</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Price/Night</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amenities</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccommodations.map((accommodation) => (
                <TableRow key={accommodation.id}>
                  <TableCell className="font-medium">{accommodation.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{accommodation.type}</Badge>
                  </TableCell>
                  <TableCell>{accommodation.tripName}</TableCell>
                  <TableCell>{renderStars(accommodation.rating)}</TableCell>
                  <TableCell>${accommodation.pricePerNight}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{accommodation.description}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {accommodation.amenities.slice(0, 2).map((amenity) => (
                        <Badge key={amenity} variant="secondary" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {accommodation.amenities.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{accommodation.amenities.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{accommodation.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <a href={accommodation.bookingUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Booking
                          </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/accommodations/${accommodation.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteAccommodation(accommodation.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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
    </div>
  )
}
