"use client";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  MoreHorizontal,
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  ArrowUpDown,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import {
  updateUserRoleAndStatus,
  updateUserDetails,
  deleteUser,
} from "@/actions";
import { toast } from "sonner";

interface Trip {
  id: string;
  // Add other trip properties as needed
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  status: boolean;
  createdAt: Date;
  trips: Trip[];
}

type SearchField = "name" | "email";
type SortField = "name" | "email" | "role" | "status" | "trips" | "createdAt";
type SortOrder = "asc" | "desc";

interface EditingUser {
  id: string;
  field: "name" | "email";
  value: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<SearchField>("name");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter((user) => {
      const fieldValue = user[searchField]?.toLowerCase() || "";
      return fieldValue.includes(searchQuery.toLowerCase());
    });

    // Sort the filtered users
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        case "email":
          comparison = (a.email || "").localeCompare(b.email || "");
          break;
        case "role":
          comparison = (a.role || "").localeCompare(b.role || "");
          break;
        case "status":
          comparison = a.status === b.status ? 0 : a.status ? 1 : -1;
          break;
        case "trips":
          comparison = (a.trips?.length || 0) - (b.trips?.length || 0);
          break;
        case "createdAt":
          // Convert string dates to Date objects if needed
          const dateA =
            typeof a.createdAt === "string"
              ? new Date(a.createdAt)
              : a.createdAt;
          const dateB =
            typeof b.createdAt === "string"
              ? new Date(b.createdAt)
              : b.createdAt;
          comparison = dateA.getTime() - dateB.getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredUsers(sorted);
  }, [searchQuery, searchField, users, sortField, sortOrder]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsUpdating(userId);
    try {
      const result = await updateUserRoleAndStatus(userId, { role: newRole });
      if (result.success) {
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
        toast.success("Role updated successfully");
      } else {
        toast.error("Failed to update role");
      }
    } catch (error) {
      toast.error("An error occurred while updating role");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: boolean) => {
    setIsUpdating(userId);
    try {
      const result = await updateUserRoleAndStatus(userId, {
        status: newStatus,
      });
      if (result.success) {
        setUsers(
          users.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  status: newStatus,
                  deletedAt: newStatus ? null : new Date(),
                }
              : user
          )
        );
        toast.success(
          newStatus
            ? "User activated successfully"
            : "User deactivated successfully"
        );
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred while updating status");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleStartEditing = (
    userId: string,
    field: "name" | "email",
    currentValue: string
  ) => {
    setEditingUser({ id: userId, field, value: currentValue });
  };

  const handleCancelEditing = () => {
    setEditingUser(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    setIsUpdating(editingUser.id);
    try {
      const updates = {
        [editingUser.field]: editingUser.value,
      };

      const result = await updateUserDetails(editingUser.id, updates);

      if (result.success) {
        setUsers(
          users.map((user) =>
            user.id === editingUser.id
              ? { ...user, [editingUser.field]: editingUser.value }
              : user
          )
        );
        toast.success(
          `${
            editingUser.field === "name" ? "Name" : "Email"
          } updated successfully`
        );
        setEditingUser(null);
      } else {
        toast.error(`Failed to update ${editingUser.field}`);
      }
    } catch (error) {
      toast.error("An error occurred while updating");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setIsDeleting(userId);
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        setUsers(
          users.map((user) =>
            user.id === userId
              ? { ...user, status: false, deletedAt: new Date() }
              : user
          )
        );
        toast.success("User deleted successfully");
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      toast.error("An error occurred while deleting user");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Link href="/dashboard/users/create">
          <Button className="bg-slate-800 hover:bg-slate-700 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage all user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Select
              value={searchField}
              onValueChange={(value: SearchField) => setSearchField(value)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder={`Search by ${searchField}...`}
              className="max-w-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
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
                    onClick={() => handleSort("email")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Email
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("role")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Role
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
                    onClick={() => handleSort("trips")}
                    className="flex items-center gap-1 mx-auto"
                  >
                    Trips
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
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} className="group relative">
                  <TableCell
                    className="text-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() =>
                      !editingUser &&
                      handleStartEditing(user.id, "name", user.name || "")
                    }
                  >
                    {editingUser?.id === user.id &&
                    editingUser.field === "name" ? (
                      <div className="flex items-center justify-center gap-2">
                        <Input
                          value={editingUser.value}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              value: e.target.value,
                            })
                          }
                          className="w-[200px]"
                          disabled={isUpdating === user.id}
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
                            disabled={isUpdating === user.id}
                            className="h-7 px-2"
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditing();
                            }}
                            disabled={isUpdating === user.id}
                            className="h-7 px-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span className="text-sm">{user.name || "N/A"}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-center cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() =>
                      !editingUser &&
                      handleStartEditing(user.id, "email", user.email || "")
                    }
                  >
                    {editingUser?.id === user.id &&
                    editingUser.field === "email" ? (
                      <div className="flex items-center justify-center gap-2">
                        <Input
                          value={editingUser.value}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              value: e.target.value,
                            })
                          }
                          className="w-[200px]"
                          type="email"
                          disabled={isUpdating === user.id}
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
                            disabled={isUpdating === user.id}
                            className="h-7 px-2"
                          >
                            Save
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEditing();
                            }}
                            disabled={isUpdating === user.id}
                            className="h-7 px-2"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span className="text-sm">{user.email || "N/A"}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Select
                      value={user.role}
                      onValueChange={(value) =>
                        handleRoleChange(user.id, value)
                      }
                      disabled={isUpdating === user.id}
                    >
                      <SelectTrigger className="w-[100px] mx-auto">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Switch
                        checked={user.status}
                        onCheckedChange={(checked) =>
                          handleStatusChange(user.id, checked)
                        }
                        disabled={isUpdating === user.id}
                        className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
                      />
                      <span className="text-sm">
                        {user.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {user?.trips?.length}
                  </TableCell>
                  <TableCell className="text-center">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
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
                          <Link href={`/admin/users/${user.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}/assign-trip`}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Assign Trip
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isDeleting === user.id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {isDeleting === user.id ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
