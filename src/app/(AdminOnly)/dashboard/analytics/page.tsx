import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Users, MapPin, DollarSign, Star } from "lucide-react"

export default function AnalyticsPage() {
  // Mock analytics data
  const analytics = {
    userGrowth: {
      current: 1247,
      previous: 1156,
      change: 7.9,
    },
    tripBookings: {
      current: 89,
      previous: 76,
      change: 17.1,
    },
    revenue: {
      current: 45670,
      previous: 38920,
      change: 17.3,
    },
    satisfaction: {
      current: 4.7,
      previous: 4.5,
      change: 4.4,
    },
    topDestinations: [
      { name: "Paris, France", bookings: 23, revenue: 12500 },
      { name: "Tokyo, Japan", bookings: 18, revenue: 15600 },
      { name: "London, UK", bookings: 15, revenue: 8900 },
      { name: "New York, USA", bookings: 12, revenue: 9800 },
      { name: "Rome, Italy", bookings: 10, revenue: 7200 },
    ],
    monthlyStats: [
      { month: "Jan", users: 156, trips: 23, revenue: 12500 },
      { month: "Feb", users: 189, trips: 31, revenue: 18900 },
      { month: "Mar", users: 234, trips: 28, revenue: 16700 },
      { month: "Apr", users: 198, trips: 35, revenue: 21200 },
      { month: "May", users: 267, trips: 42, revenue: 25800 },
      { month: "Jun", users: 203, trips: 38, revenue: 23100 },
    ],
  }

  const formatChange = (change: number) => {
    const isPositive = change > 0
    return (
      <div className={`flex items-center ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
        <span className="text-sm font-medium">{Math.abs(change)}%</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track platform performance and user engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.userGrowth.current.toLocaleString()}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">vs last month</p>
              {formatChange(analytics.userGrowth.change)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trip Bookings</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.tripBookings.current}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">vs last month</p>
              {formatChange(analytics.tripBookings.change)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.revenue.current.toLocaleString()}</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">vs last month</p>
              {formatChange(analytics.revenue.change)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.satisfaction.current}/5</div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">vs last month</p>
              {formatChange(analytics.satisfaction.change)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Destinations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Destinations</CardTitle>
            <CardDescription>Most popular travel destinations this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topDestinations.map((destination, index) => (
                <div key={destination.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{destination.name}</div>
                      <div className="text-sm text-muted-foreground">{destination.bookings} bookings</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${destination.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>6-month performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.monthlyStats.map((stat) => (
                <div key={stat.month} className="grid grid-cols-4 gap-4 items-center">
                  <div className="font-medium">{stat.month}</div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{stat.users}</div>
                    <div className="text-xs text-muted-foreground">users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{stat.trips}</div>
                    <div className="text-xs text-muted-foreground">trips</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">${stat.revenue.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Insights */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Engagement</CardTitle>
            <CardDescription>Platform usage statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Daily Active Users</span>
              <Badge variant="default">342</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Avg. Session Duration</span>
              <Badge variant="secondary">12m 34s</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Bounce Rate</span>
              <Badge variant="outline">23.4%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Return Visitors</span>
              <Badge variant="default">67.8%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trip Categories</CardTitle>
            <CardDescription>Popular trip types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Cultural Tours</span>
              <Badge variant="default">34%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Adventure Travel</span>
              <Badge variant="secondary">28%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">City Breaks</span>
              <Badge variant="outline">22%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Beach Holidays</span>
              <Badge variant="default">16%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Platform performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">API Response Time</span>
              <Badge variant="default">245ms</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Uptime</span>
              <Badge variant="default">99.9%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Error Rate</span>
              <Badge variant="secondary">0.1%</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Database Load</span>
              <Badge variant="outline">Low</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
