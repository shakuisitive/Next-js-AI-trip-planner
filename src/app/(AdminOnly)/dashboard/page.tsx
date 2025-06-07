import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  MapPin,
  MessageSquare,
  Calendar,
  TrendingUp,
  UserCheck,
  Star,
  DollarSign,
} from "lucide-react";

export default function AdminDashboard() {
  // In a real app, these would come from your database
  const stats = {
    totalUsers: 1247,
    activeTrips: 89,
    pendingFeedback: 23,
    activeSessions: 156,
    monthlyRevenue: 45670,
    completedTrips: 234,
    averageRating: 4.7,
    newUsersThisMonth: 67,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your trip planning platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{stats.newUsersThisMonth} from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrips}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Feedback
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingFeedback}</div>
            <p className="text-xs text-muted-foreground">
              Requires admin response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sessions
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Users currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Trips
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTrips}</div>
            <p className="text-xs text-muted-foreground">All time total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Rating
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}/5</div>
            <p className="text-xs text-muted-foreground">
              From customer feedback
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+23%</div>
            <p className="text-xs text-muted-foreground">
              User growth this quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/users/create"
              className="block p-2 rounded hover:bg-muted transition-colors"
            >
              + Create New User
            </a>
            <a
              href="/admin/trips/create"
              className="block p-2 rounded hover:bg-muted transition-colors"
            >
              + Create New Trip
            </a>
            <a
              href="/admin/feedback"
              className="block p-2 rounded hover:bg-muted transition-colors"
            >
              📝 Review Pending Feedback
            </a>
            <a
              href="/admin/sessions"
              className="block p-2 rounded hover:bg-muted transition-colors"
            >
              🔐 Manage User Sessions
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest system events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">John Doe</span> created a new trip
              to Paris
              <div className="text-xs text-muted-foreground">2 hours ago</div>
            </div>
            <div className="text-sm">
              <span className="font-medium">Admin</span> responded to feedback
              #123
              <div className="text-xs text-muted-foreground">4 hours ago</div>
            </div>
            <div className="text-sm">
              <span className="font-medium">Jane Smith</span> completed Tokyo
              trip
              <div className="text-xs text-muted-foreground">6 hours ago</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Platform health overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">API Status</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Operational
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Database</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Healthy
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Weather API</span>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                Connected
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">OpenAI API</span>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Rate Limited
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
