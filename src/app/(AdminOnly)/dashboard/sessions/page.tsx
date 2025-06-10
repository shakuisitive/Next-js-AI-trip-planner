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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Search, LogOut, ArrowUpDown } from "lucide-react";
import { getSessions, deleteSession, updateSessionExpires } from "@/actions";
import { toast } from "sonner";

type SortField = "userName" | "sessionToken" | "status" | "createdAt" | "expires";
type SortOrder = "asc" | "desc";

export default function SessionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingExpires, setEditingExpires] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const result = await getSessions();
        if (result.success && result.sessions) {
          setSessions(result.sessions);
        } else {
          setSessions([]);
        }
      } catch (error) {
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(
    (session) =>
      (session.user?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (session.user?.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const result = await deleteSession(sessionId);
      if (result.success) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      } else {
        alert("Failed to terminate session");
      }
    } catch (error) {
      console.error("Error terminating session:", error);
      alert("Error terminating session");
    }
  };

  const handleUpdateExpires = async (sessionId: string, newExpires: string) => {
    try {
      const result = await updateSessionExpires(
        sessionId,
        new Date(newExpires)
      );
      if (result.success) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId ? { ...s, expires: newExpires } : s
          )
        );
        setEditingExpires(null);
      } else {
        alert("Failed to update expires date");
      }
    } catch (error) {
      console.error("Error updating expires date:", error);
      alert("Error updating expires date");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSessionStatus = (expiresDate: string) => {
    const now = new Date();
    const expires = new Date(expiresDate);
    const hoursUntilExpiry =
      (expires.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (expires < now) {
      return { status: "Expired", variant: "destructive" as const };
    }
    if (hoursUntilExpiry <= 24) {
      return { status: "Expiring Soon", variant: "secondary" as const };
    }
    return { status: "Active", variant: "default" as const };
  };

  const formatExpiresForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedSessions = [...filteredSessions].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "userName":
        const nameA = a.user?.name || "";
        const nameB = b.user?.name || "";
        comparison = nameA.localeCompare(nameB);
        break;
      case "sessionToken":
        comparison = a.sessionToken.localeCompare(b.sessionToken);
        break;
      case "status":
        const statusA = getSessionStatus(a.expires).status;
        const statusB = getSessionStatus(b.expires).status;
        comparison = statusA.localeCompare(statusB);
        break;
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "expires":
        comparison = new Date(a.expires).getTime() - new Date(b.expires).getTime();
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Sessions</h1>
        <p className="text-muted-foreground">
          Monitor and manage active user sessions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            View and terminate user sessions to log out users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("userName")}
                    className="flex items-center gap-1"
                  >
                    User
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("sessionToken")}
                    className="flex items-center gap-1"
                  >
                    Session Token
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-1"
                  >
                    Status
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center gap-1"
                  >
                    Created
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("expires")}
                    className="flex items-center gap-1"
                  >
                    Expires
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSessions.map((session) => {
                const sessionStatus = getSessionStatus(session.expires);
                return (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.user?.name || "-"}</div>
                        <div className="text-sm text-muted-foreground">
                          {session.user?.email || "-"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {session.sessionToken}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sessionStatus.variant}
                       className={sessionStatus.status === "Active" ? "bg-green-500 text-white hover:bg-green-600" : ""}>
                        {sessionStatus.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(session.createdAt)}</TableCell>
                    <TableCell>
                      {editingExpires === session.id ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="datetime-local"
                            defaultValue={formatExpiresForInput(
                                session.expires
                            )}
                            onChange={(e) => {
                              if (e.target.value) {
                                handleUpdateExpires(
                                  session.id,
                                  new Date(e.target.value).toISOString()
                                );
                              }
                            }}
                            className="w-48"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingExpires(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div
                          className={`cursor-pointer hover:underline ${sessionStatus.status === "Expired" ? "text-red-600" : ""}`}
                          onClick={() => setEditingExpires(session.id)}
                        >
                          {formatDate(session.expires)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Terminate
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Terminate Session
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to terminate this session?
                              This will log out {session.user?.name || "this user"} immediately.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleTerminateSession(session.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Terminate Session
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
