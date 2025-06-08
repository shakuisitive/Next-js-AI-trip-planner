"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search, Edit, Trash2, Eye, UserPlus } from "lucide-react"
import Link from "next/link"
import { getTrips } from "@/actions"
import { format } from "date-fns"
import { toast } from "sonner"

interface Trip {
  id: string;
  tourName: string;
  destination: string;
  user: {
    name: string | null;
    email: string | null;
  } | null;
  startDate: Date;
  endDate: Date;
  tourStatus: string;
  budgetMin: number;
  budgetMax: number;
  createdAt: Date;
}

export default function TripsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const result = await getTrips()
        if (result.success) {
          setTrips(result.trips)
        } else {
          toast.error("Failed to fetch trips")
        }
      } catch (error) {
        toast.error("An error occurred while fetching trips")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrips()
  }, [])

  const filteredTrips = trips.filter(
    (trip) =>
      trip.tourName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (trip.user?.name && trip.user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "default"
      case "Pending Approval":
        return "secondary"
      case "Completed":
        return "outline"
      default:
        return "secondary"
    }
  }

  const handleDeleteTrip = async (tripId: string) => {
    console.log("Soft deleting trip:", tripId)
    // Implement soft delete logic
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trips</h1>
          <p className="text-muted-foreground">Manage trip packages and assignments</p>
        </div>
        <Link href="/admin/trips/create">
          <Button className="bg-slate-800 hover:bg-slate-700 text-white">
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
                    {trip.user ? (
                      <div>
                        <div className="font-medium">{trip.user.name}</div>
                        <div className="text-sm text-muted-foreground">{trip.user.email}</div>
                      </div>
                    ) : (
                      <Badge variant="outline">Unassigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(trip.startDate), "MMM d, yyyy")}</div>
                      <div className="text-muted-foreground">to {format(new Date(trip.endDate), "MMM d, yyyy")}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    ${trip.budgetMin} - ${trip.budgetMax}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(trip.tourStatus)}>{trip.tourStatus}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(trip.createdAt), "MMM d, yyyy")}</TableCell>
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
                        {!trip.user && (
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
