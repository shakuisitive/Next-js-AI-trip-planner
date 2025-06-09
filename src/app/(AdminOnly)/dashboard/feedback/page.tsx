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
import { Star, Search, MessageSquare } from "lucide-react";
import { getTripFeedbacks } from "@/actions";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface TripFeedback {
  id: string;
  tripId: string;
  userId: string;
  rating: number;
  review: string;
  suggestion: string | null;
  createdAt: Date;
  trip: {
    tourName: string;
  };
  user: {
    name: string;
    email: string;
  };
}

export default function FeedbackPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbacks, setFeedbacks] = useState<TripFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<TripFeedback | null>(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const result = await getTripFeedbacks();
        if (result.success && result.feedbacks) {
          setFeedbacks(result.feedbacks as TripFeedback[]);
        } else {
          toast.error("Failed to fetch feedback");
        }
      } catch (error) {
        toast.error("An error occurred while fetching feedback");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      feedback.trip.tourName.toLowerCase().includes(searchTermLower) ||
      feedback.user.name.toLowerCase().includes(searchTermLower) ||
      feedback.review.toLowerCase().includes(searchTermLower) ||
      (feedback.suggestion?.toLowerCase().includes(searchTermLower) ?? false)
    );
  });

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="flex items-center">
        {Array.from({ length: fullStars }, (_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && <Star className="h-4 w-4 fill-yellow-400/50 text-yellow-400" />}
        <span className="ml-1 text-sm">({rating})</span>
      </div>
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Trip Feedback</h1>
        <p className="text-muted-foreground">View customer feedback and suggestions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Feedback</CardTitle>
          <CardDescription>View feedback and private suggestions from customers</CardDescription>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.map((feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell>
                    <div className="font-medium">{feedback.trip.tourName}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{feedback.user.name}</div>
                      <div className="text-sm text-muted-foreground">{feedback.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{renderStars(feedback.rating)}</TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">{feedback.review}</div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate text-muted-foreground">
                      {feedback.suggestion || "No private suggestion"}
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(feedback.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFeedback(feedback)}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Feedback Details</DialogTitle>
                          <DialogDescription>
                            Feedback for {feedback.trip.tourName} by {feedback.user.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Rating & Review</h4>
                            <div className="flex items-center space-x-2 mb-2">
                              {renderStars(feedback.rating)}
                            </div>
                            <p className="text-sm bg-gray-50 p-3 rounded">
                              {feedback.review}
                            </p>
                          </div>

                          {feedback.suggestion && (
                            <div>
                              <h4 className="font-medium mb-2">Private Suggestion</h4>
                              <p className="text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                                {feedback.suggestion}
                              </p>
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
