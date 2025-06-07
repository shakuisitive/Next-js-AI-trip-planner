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
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Star, MessageSquare, Search, Reply } from "lucide-react";

// Mock data
const feedbacks = [
  {
    id: "1",
    tripId: "1",
    tourName: "Paris Adventure",
    userName: "John Doe",
    userEmail: "john@example.com",
    rating: 5,
    review: "Amazing trip! Everything was perfectly organized.",
    suggestion:
      "Maybe add more free time in the itinerary for personal exploration.",
    createdAt: "2024-01-20",
    hasResponse: false,
  },
  {
    id: "2",
    tripId: "2",
    tourName: "Tokyo Explorer",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    rating: 4,
    review: "Great experience overall, loved the cultural activities.",
    suggestion: "The hotel could be closer to the city center.",
    createdAt: "2024-01-18",
    hasResponse: true,
  },
  {
    id: "3",
    tripId: "3",
    tourName: "London Getaway",
    userName: "Bob Wilson",
    userEmail: "bob@example.com",
    rating: 3,
    review: "Good trip but had some issues with transportation.",
    suggestion: "Need better coordination with local transport providers.",
    createdAt: "2024-01-15",
    hasResponse: false,
  },
];

export default function FeedbackPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [response, setResponse] = useState("");

  const filteredFeedbacks = feedbacks.filter(
    (feedback) =>
      feedback.tourName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feedback.review.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitResponse = async () => {
    if (!selectedFeedback || !response.trim()) return;

    try {
      // Implement response submission logic
      console.log(
        "Submitting response for feedback:",
        selectedFeedback.id,
        response
      );
      setResponse("");
      setSelectedFeedback(null);
    } catch (error) {
      console.error("Error submitting response:", error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trip Feedback</h1>
        <p className="text-muted-foreground">
          Review and respond to customer feedback
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Feedback</CardTitle>
          <CardDescription>
            Manage feedback and private suggestions from customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Private Suggestion</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>
                    <div className="font-medium">{feedback.tourName}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{feedback.userName}</div>
                      <div className="text-sm text-muted-foreground">
                        {feedback.userEmail}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {renderStars(feedback.rating)}
                      <span className="ml-2 text-sm">
                        ({feedback.rating}/5)
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{feedback.review}</div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate text-muted-foreground">
                      {feedback.suggestion || "No private suggestion"}
                    </div>
                  </TableCell>
                  <TableCell>{feedback.createdAt}</TableCell>
                  <TableCell>
                    <Badge
                      variant={feedback.hasResponse ? "default" : "secondary"}
                    >
                      {feedback.hasResponse ? "Responded" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFeedback(feedback)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          {feedback.hasResponse ? "View" : "Respond"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Feedback Details</DialogTitle>
                          <DialogDescription>
                            Feedback for {feedback.tourName} by{" "}
                            {feedback.userName}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">
                              Rating & Review
                            </h4>
                            <div className="flex items-center space-x-2 mb-2">
                              {renderStars(feedback.rating)}
                              <span>({feedback.rating}/5)</span>
                            </div>
                            <p className="text-sm bg-gray-50 p-3 rounded">
                              {feedback.review}
                            </p>
                          </div>

                          {feedback.suggestion && (
                            <div>
                              <h4 className="font-medium mb-2">
                                Private Suggestion
                              </h4>
                              <p className="text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                                {feedback.suggestion}
                              </p>
                            </div>
                          )}

                          {!feedback.hasResponse && (
                            <div>
                              <h4 className="font-medium mb-2">
                                Admin Response
                              </h4>
                              <Textarea
                                placeholder="Write your response to the customer's private suggestion..."
                                value={response}
                                onChange={(e) => setResponse(e.target.value)}
                                rows={4}
                              />
                              <Button
                                onClick={handleSubmitResponse}
                                className="mt-2"
                                disabled={!response.trim()}
                              >
                                <Reply className="h-4 w-4 mr-2" />
                                Send Response
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
