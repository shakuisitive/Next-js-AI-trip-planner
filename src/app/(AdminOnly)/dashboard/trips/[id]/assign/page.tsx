"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock data
const trip = {
  id: "1",
  tourName: "Paris Adventure",
  destination: "Paris, France",
  startDate: "2024-02-15",
  endDate: "2024-02-22",
  budgetMin: 2000,
  budgetMax: 3000,
}

const availableUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", trips: 2 },
  { id: "2", name: "Jane Smith", email: "jane@example.com", trips: 1 },
  { id: "3", name: "Bob Wilson", email: "bob@example.com", trips: 0 },
  { id: "4", name: "Alice Johnson", email: "alice@example.com", trips: 3 },
]

export default function AssignTripPage() {
  const router = useRouter()
  const [selectedUserId, setSelectedUserId] = useState("")

  const handleAssignTrip = async () => {
    if (!selectedUserId) return

    try {
      // Implement trip assignment logic
      const response = await fetch(`/api/admin/trips/${trip.id}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: selectedUserId }),
      })

      if (response.ok) {
        router.push("/admin/trips")
      }
    } catch (error) {
      console.error("Error assigning trip:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/admin/trips">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Trips
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Assign Trip</h1>
          <p className="text-muted-foreground">Assign a user to this trip package</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trip Details */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
            <CardDescription>Information about the trip to be assigned</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Tour Name</Label>
              <p className="text-lg font-semibold">{trip.tourName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Destination</Label>
              <p>{trip.destination}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Start Date</Label>
                <p>{trip.startDate}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">End Date</Label>
                <p>{trip.endDate}</p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Budget Range</Label>
              <p>
                ${trip.budgetMin.toLocaleString()} - ${trip.budgetMax.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Assignment */}
        <Card>
          <CardHeader>
            <CardTitle>Assign User</CardTitle>
            <CardDescription>Select a user to assign this trip to</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {user.email} • {user.trips} trips
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedUserId && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Assignment Summary</h4>
                <p className="text-sm text-blue-700">
                  {availableUsers.find((u) => u.id === selectedUserId)?.name} will be assigned to "{trip.tourName}".
                  They will receive a notification about this assignment.
                </p>
              </div>
            )}

            <div className="flex space-x-2 pt-4">
              <Button onClick={handleAssignTrip} disabled={!selectedUserId}>
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Trip
              </Button>
              <Link href="/admin/trips">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
