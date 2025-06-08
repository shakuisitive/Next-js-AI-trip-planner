"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  ArrowUpDown,
  Check,
  X,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  getTrips,
  updateTripDetails,
  getAllUsers,
  updateTripUser,
} from "@/actions";
import { format } from "date-fns";
import { toast } from "sonner";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  tourStatus: string | null;
  status: boolean | null;
  budgetMin: number;
  budgetMax: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userId: string;
}

interface EditingTrip {
  id: string;
  field: "tourName" | "startDate" | "endDate" | "budgetMin" | "budgetMax";
  value: string | number | Date;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

type SearchField = "tourName" | "destination" | "user";
type SortField =
  | "tourName"
  | "destination"
  | "startDate"
  | "budgetMin"
  | "tourStatus"
  | "status"
  | "createdAt"
  | "userName";
type SortOrder = "asc" | "desc";

export default function TripsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("tourName");
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [editingTrip, setEditingTrip] = useState<EditingTrip | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTripForReassign, setSelectedTripForReassign] =
    useState<Trip | null>(null);
  const [isReassigning, setIsReassigning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 3;
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<string>("");
  const [tempEndDate, setTempEndDate] = useState<string>("");
  const [tempBudgetMin, setTempBudgetMin] = useState<number>(0);
  const [tempBudgetMax, setTempBudgetMax] = useState<number>(0);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const result = await getTrips();
        if (result.success && result.trips) {
          setTrips(result.trips);
        } else {
          toast.error("Failed to fetch trips");
        }
      } catch (error) {
        toast.error("An error occurred while fetching trips");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrips();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getAllUsers();
        if (result.success && result.users) {
          setUsers(result.users);
        }
      } catch (error) {
        toast.error("Failed to fetch users");
      }
    };

    fetchUsers();
  }, []);

  const filteredTrips = trips.filter((trip) => {
    const searchTermLower = searchTerm.toLowerCase();

    switch (searchField) {
      case "tourName":
        return trip.tourName.toLowerCase().includes(searchTermLower);
      case "destination":
        return trip.destination.toLowerCase().includes(searchTermLower);
      case "user":
        return (
          (trip.user?.name?.toLowerCase().includes(searchTermLower) ?? false) ||
          (trip.user?.email?.toLowerCase().includes(searchTermLower) ?? false)
        );
      default:
        return true;
    }
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "tourName":
        comparison = a.tourName.localeCompare(b.tourName);
        break;
      case "destination":
        comparison = a.destination.localeCompare(b.destination);
        break;
      case "startDate":
        comparison =
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        break;
      case "budgetMin":
        comparison = a.budgetMin - b.budgetMin;
        break;
      case "tourStatus":
        const statusA = a.tourStatus ?? "";
        const statusB = b.tourStatus ?? "";
        comparison = statusA.localeCompare(statusB);
        break;
      case "status":
        comparison = a.status === b.status ? 0 : a.status ? 1 : -1;
        break;
      case "createdAt":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "userName":
        const nameA = a.user?.name || "";
        const nameB = b.user?.name || "";
        comparison = nameA.localeCompare(nameB);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "default";
      case "Pending Approval":
        return "secondary";
      case "Completed":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-700";
      case "Pending Approval":
        return "bg-yellow-100 text-yellow-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    console.log("Soft deleting trip:", tripId);
    // Implement soft delete logic
  };

  const handleStartEditing = (
    tripId: string,
    field: "tourName" | "startDate" | "endDate" | "budgetMin" | "budgetMax",
    currentValue: string | number | Date
  ) => {
    if (field === "startDate") {
      const trip = trips.find(t => t.id === tripId);
      if (trip) {
        setTempStartDate(trip.startDate.toISOString().split('T')[0]);
        setTempEndDate(trip.endDate.toISOString().split('T')[0]);
        setEditingTrip({ id: tripId, field, value: currentValue });
        setIsEditModalOpen(true);
      }
    } else if (field === "budgetMin") {
      const trip = trips.find(t => t.id === tripId);
      if (trip) {
        setTempBudgetMin(trip.budgetMin);
        setTempBudgetMax(trip.budgetMax);
        setEditingTrip({ id: tripId, field, value: currentValue });
        setIsEditModalOpen(true);
      }
    } else {
      setEditingTrip({ id: tripId, field, value: currentValue });
    }
  };

  const handleCancelEditing = () => {
    setEditingTrip(null);
  };

  const handleSaveEdit = async () => {
    if (!editingTrip) return;

    setIsUpdating(editingTrip.id);
    try {
      const updates: any = {};

      switch (editingTrip.field) {
        case "startDate":
          updates.startDate = new Date(tempStartDate);
          updates.endDate = new Date(tempEndDate);
          break;
        case "budgetMin":
          updates.budgetMin = tempBudgetMin;
          updates.budgetMax = tempBudgetMax;
          break;
        default:
          updates[editingTrip.field] = editingTrip.value;
      }

      const result = await updateTripDetails(editingTrip.id, updates);

      if (result.success) {
        setTrips(
          trips.map((trip) =>
            trip.id === editingTrip.id
              ? { ...trip, ...updates }
              : trip
          )
        );
        toast.success("Trip updated successfully");
        setEditingTrip(null);
        setIsEditModalOpen(false);
      } else {
        toast.error("Failed to update trip");
      }
    } catch (error) {
      toast.error("An error occurred while updating");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleReassignTrip = async (userId: string) => {
    if (!selectedTripForReassign) return;

    setIsReassigning(true);
    try {
      const result = await updateTripUser(selectedTripForReassign.id, userId);
      if (result.success && result.trip) {
        setTrips(
          trips.map((trip) =>
            trip.id === selectedTripForReassign.id
              ? (result.trip as Trip)
              : trip
          )
        );
        toast.success("Trip reassigned successfully");
        setSelectedTripForReassign(null);
      } else {
        toast.error("Failed to reassign trip");
      }
    } catch (error) {
      toast.error("An error occurred while reassigning");
    } finally {
      setIsReassigning(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const searchTerm = userSearchTerm.toLowerCase();
    return (
      (user.name?.toLowerCase().includes(searchTerm) ?? false) ||
      (user.email?.toLowerCase().includes(searchTerm) ?? false)
    );
  });

  // Update pagination to use filtered users
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [userSearchTerm]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trips</h1>
          <p className="text-muted-foreground">
            Manage trip packages and assignments
          </p>
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
              placeholder={`Search by ${
                searchField === "user" ? "user name or email" : searchField
              }...`}
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
                  <TableCell
                    className="text-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() =>
                      !editingTrip &&
                      handleStartEditing(trip.id, "tourName", trip.tourName)
                    }
                  >
                    {editingTrip?.id === trip.id &&
                    editingTrip.field === "tourName" ? (
                      <div className="flex items-center justify-center gap-2 h-8">
                        <Input
                          value={editingTrip.value as string}
                          onChange={(e) =>
                            setEditingTrip({
                              ...editingTrip,
                              value: e.target.value,
                            })
                          }
                          className="w-[200px] h-8"
                          disabled={isUpdating === trip.id}
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
                            disabled={isUpdating === trip.id}
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
                            disabled={isUpdating === trip.id}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-8">
                        <span className="text-sm">{trip.tourName}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {trip.destination}
                  </TableCell>
                  <TableCell className="text-center">
                    {trip.user ? (
                      <div>
                        <div className="font-medium">{trip.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {trip.user.email}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-slate-100">
                        Unassigned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="group flex items-center justify-center gap-1 h-8 px-3 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleStartEditing(trip.id, "startDate", trip.startDate)}
                    >
                      <span className="text-sm font-medium whitespace-nowrap">
                        {format(new Date(trip.startDate), "MMM d, yyyy")} - {format(new Date(trip.endDate), "MMM d, yyyy")}
                      </span>
                      <Edit className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div
                      className="group flex items-center justify-center gap-1 h-8 px-3 rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => handleStartEditing(trip.id, "budgetMin", trip.budgetMin)}
                    >
                      <span className="text-sm font-medium">${trip.budgetMin.toLocaleString()} - ${trip.budgetMax.toLocaleString()}</span>
                      <Edit className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={getStatusColor(trip.tourStatus ?? "")}
                      className={getStatusStyle(trip.tourStatus ?? "")}
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
                        <DropdownMenuItem
                          onClick={() => setSelectedTripForReassign(trip)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Reassign User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteTrip(trip.id)}
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

      <Dialog
        open={!!selectedTripForReassign}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTripForReassign(null);
            setUserSearchTerm(""); // Reset search when closing modal
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reassign Trip</DialogTitle>
            <DialogDescription>
              Select a user to reassign this trip to
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <h4 className="font-medium">Current Trip</h4>
              <div className="rounded-lg border p-3 bg-muted/50">
                <p className="text-sm font-medium">
                  {selectedTripForReassign?.tourName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedTripForReassign?.destination}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Select New User</h4>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="grid gap-3">
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <Button
                      key={user.id}
                      variant="outline"
                      className="justify-start h-auto py-3 px-4 hover:bg-muted/50"
                      onClick={() => handleReassignTrip(user.id)}
                      disabled={isReassigning}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-medium">
                          {user.name || "Unnamed User"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </Button>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No users found matching your search
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            className="cursor-pointer"
                            onClick={() => handlePageChange(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTrip?.field === "startDate" ? "Edit Trip Dates" : "Edit Budget Range"}
            </DialogTitle>
          </DialogHeader>
          
          {editingTrip?.field === "startDate" ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          ) : editingTrip?.field === "budgetMin" ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    value={tempBudgetMin}
                    onChange={(e) => setTempBudgetMin(Number(e.target.value))}
                    className="w-full pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Maximum Budget</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    value={tempBudgetMax}
                    onChange={(e) => setTempBudgetMax(Number(e.target.value))}
                    className="w-full pl-7"
                  />
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingTrip(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isUpdating === editingTrip?.id}
            >
              {isUpdating === editingTrip?.id ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
