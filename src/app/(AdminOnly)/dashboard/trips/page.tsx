"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Search, Edit, Trash2, Eye, UserPlus, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { getTrips } from "@/actions"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
  status: boolean | null;
  budgetMin: number;
  budgetMax: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userId: string;
}

type SearchField = "tourName" | "destination" | "user";
type SortField = "tourName" | "destination" | "startDate" | "budgetMin" | "tourStatus" | "status" | "createdAt" | "userName";
type SortOrder = "asc" | "desc";

export default function TripsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchField, setSearchField] = useState<SearchField>("tourName")
  const [trips, setTrips] = useState<Trip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const result = await getTrips()
        if (result.success && result.trips) {
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

  const filteredTrips = trips.filter((trip) => {
    const searchTermLower = searchTerm.toLowerCase()
    
    switch (searchField) {
      case "tourName":
        return trip.tourName.toLowerCase().includes(searchTermLower)
      case "destination":
        return trip.destination.toLowerCase().includes(searchTermLower)
      case "user":
        return (
          (trip.user?.name?.toLowerCase().includes(searchTermLower) ?? false) ||
          (trip.user?.email?.toLowerCase().includes(searchTermLower) ?? false)
        )
      default:
        return true
    }
  })

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case "tourName":
        comparison = a.tourName.localeCompare(b.tourName)
        break
      case "destination":
        comparison = a.destination.localeCompare(b.destination)
        break
      case "startDate":
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        break
      case "budgetMin":
        comparison = a.budgetMin - b.budgetMin
        break
      case "tourStatus":
        comparison = a.tourStatus.localeCompare(b.tourStatus)
        break
      case "status":
        comparison = (a.status === b.status) ? 0 : a.status ? 1 : -1
        break
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        break
      case "userName":
        const nameA = a.user?.name || ""
        const nameB = b.user?.name || ""
        comparison = nameA.localeCompare(nameB)
        break
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-700"
      case "Pending Approval":
        return "bg-yellow-100 text-yellow-700"
      case "Completed":
        return "bg-green-100 text-green-700"
      default:
        return "bg-slate-100 text-slate-700"
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
            <Select
              value={searchField}
              onValueChange={(value: SearchField) => setSearchField(value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tourName">Tour Name</SelectItem>
                <SelectItem value="destination">Destination</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={`Search by ${searchField === "user" ? "user name or email" : searchField}...`}
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("tourName")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Tour Name
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("destination")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Destination
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("userName")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Assigned User
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("startDate")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Dates
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("budgetMin")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Budget Range
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("tourStatus")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Tour Status
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
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
              {sortedTrips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="text-center">{trip.tourName}</TableCell>
                  <TableCell className="text-center">{trip.destination}</TableCell>
                  <TableCell className="text-center">
                    {trip.user ? (
                      <div>
                        <div className="font-medium">{trip.user.name}</div>
                        <div className="text-sm text-muted-foreground">{trip.user.email}</div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-slate-100">Unassigned</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="text-sm">
                      <div>{format(new Date(trip.startDate), "MMM d, yyyy")}</div>
                      <div className="text-muted-foreground">to {format(new Date(trip.endDate), "MMM d, yyyy")}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    ${trip.budgetMin} - ${trip.budgetMax}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={getStatusColor(trip.tourStatus)} 
                      className={getStatusStyle(trip.tourStatus)}
                    >
                      {trip.tourStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={trip.status ? "default" : "secondary"} 
                      className={trip.status ? "bg-green-600" : "bg-slate-100"}
                    >
                      {trip.status ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {format(new Date(trip.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/trips/${trip.id}`} className="hover:bg-slate-100">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/trips/${trip.id}/edit`} className="hover:bg-slate-100">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {!trip.user && (
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/trips/${trip.id}/assign`} className="hover:bg-slate-100">
                              <UserPlus className="mr-2 h-4 w-4" />
                              Assign User
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTrip(trip.id)} 
                          className="text-red-600 hover:bg-red-50"
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
