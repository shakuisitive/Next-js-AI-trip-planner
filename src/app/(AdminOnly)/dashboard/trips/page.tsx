"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search, Edit, Trash2, Eye, UserPlus } from "lucide-react"
import Link from "next/link"

// Mock data
const trips = [
  {
    id: "1",
    tourName: "Paris Adventure",
    destination: "Paris, France",
    userName: "John Doe",
    userEmail: "john@example.com",
    startDate: "2024-02-15",
    endDate: "2024-02-22",
    tourStatus: "Pending Approval",
    budgetMin: 2000,
    budgetMax: 3000,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    tourName: "Tokyo Explorer",
    destination: "Tokyo, Japan",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    startDate: "2024-03-10",
    endDate: "2024-03-17",
    tourStatus: "Approved",
    budgetMin: 3500,
    budgetMax: 4500,
    createdAt: "2024-01-20",
  },
  {
    id: "3",
    tourName: "London Getaway",
    destination: "London, UK",
    userName: null,
    userEmail: null,
    startDate: "2024-04-05",
    endDate: "2024-04-12",
    tourStatus: "Available",
    budgetMin: 1800,
    budgetMax: 2500,
    createdAt: "2024-01-25",
  },
]

export default function TripsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTrips = trips.filter(
    (trip) =>
      trip.tourName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trip.userName && trip.userName.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "default"
      case "Pending Approval":
        return "secondary"
      case "Available":
        return "outline"
      case "Completed":
        return "default"
      default:
        return "secondary"
    }
  }

  const handleDeleteTrip = async (tripId: string) => {
    console.log("Soft deleting trip:", tripId)
    // Implement soft delete logic
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trips</h1>
          <p className="text-muted-foreground">Manage trip packages and assignments</p>
        </div>
        <Link href="/admin/trips/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Trip
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Management</CardTitle>
          <CardDescription>View and manage all trip packages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tour Name</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Assigned User</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Budget Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">{trip.tourName}</TableCell>
                  <TableCell>{trip.destination}</TableCell>
                  <TableCell>
                    {trip.userName ? (
                      <div>
                        <div className="font-medium">{trip.userName}</div>
                        <div className="text-sm text-muted-foreground">{trip.userEmail}</div>
                      </div>
                    ) : (
                      <Badge variant="outline">Unassigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{trip.startDate}</div>
                      <div className="text-muted-foreground">to {trip.endDate}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    ${trip.budgetMin} - ${trip.budgetMax}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(trip.tourStatus)}>{trip.tourStatus}</Badge>
                  </TableCell>
                  <TableCell>{trip.createdAt}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/trips/${trip.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/trips/${trip.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {!trip.userName && (
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/trips/${trip.id}/assign`}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Assign User
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleDeleteTrip(trip.id)} className="text-red-600">
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
