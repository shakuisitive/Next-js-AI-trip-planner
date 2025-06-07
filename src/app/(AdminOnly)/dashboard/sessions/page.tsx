"use client";

import { useState } from "react";
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
import { Search, LogOut } from "lucide-react";

// Mock data
const sessions = [
  {
    id: "1",
    sessionToken: "sess_abc123...",
    userId: "user_1",
    userName: "John Doe",
    userEmail: "john@example.com",
    expires: "2024-02-15T10:30:00Z",
    createdAt: "2024-01-15T08:00:00Z",
    lastActivity: "2024-01-20T14:30:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Chrome 120.0.0.0",
  },
  {
    id: "2",
    sessionToken: "sess_def456...",
    userId: "user_2",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    expires: "2024-02-20T15:45:00Z",
    createdAt: "2024-01-18T09:15:00Z",
    lastActivity: "2024-01-20T16:20:00Z",
    ipAddress: "10.0.0.50",
    userAgent: "Safari 17.2.1",
  },
  {
    id: "3",
    sessionToken: "sess_ghi789...",
    userId: "user_3",
    userName: "Bob Wilson",
    userEmail: "bob@example.com",
    expires: "2024-01-25T12:00:00Z",
    createdAt: "2024-01-10T11:30:00Z",
    lastActivity: "2024-01-19T10:15:00Z",
    ipAddress: "172.16.0.25",
    userAgent: "Firefox 121.0",
  },
];

export default function SessionsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSessions = sessions.filter(
    (session) =>
      session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.ipAddress.includes(searchTerm)
  );

  const handleTerminateSession = async (sessionId: string) => {
    try {
      // Implement session termination logic
      console.log("Terminating session:", sessionId);
      // This would update the session status to false and set deletedAt
    } catch (error) {
      console.error("Error terminating session:", error);
    }
  };

  const isExpired = (expiresDate: string) => {
    return new Date(expiresDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSessionStatus = (expiresDate: string) => {
    const now = new Date();
    const expires = new Date(expiresDate);
    const hoursUntilExpiry =
      (expires.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (expires < now)
      return { status: "Expired", variant: "destructive" as const };
    if (hoursUntilExpiry < 24)
      return { status: "Expiring Soon", variant: "secondary" as const };
    return { status: "Active", variant: "default" as const };
  };

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
                <TableHead>User</TableHead>
                <TableHead>Session Token</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => {
                const sessionStatus = getSessionStatus(session.expires);
                return (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.userName}</div>
                        <div className="text-sm text-muted-foreground">
                          {session.userEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {session.sessionToken}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={sessionStatus.variant}>
                        {sessionStatus.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(session.createdAt)}</TableCell>
                    <TableCell>{formatDate(session.lastActivity)}</TableCell>
                    <TableCell>
                      <div
                        className={
                          isExpired(session.expires) ? "text-red-600" : ""
                        }
                      >
                        {formatDate(session.expires)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{session.ipAddress}</code>
                    </TableCell>
                    <TableCell className="text-sm">
                      {session.userAgent}
                    </TableCell>
                    <TableCell className="text-right">
                      {!isExpired(session.expires) && (
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
                                This will log out {session.userName}{" "}
                                immediately.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleTerminateSession(session.id)
                                }
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Terminate Session
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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
