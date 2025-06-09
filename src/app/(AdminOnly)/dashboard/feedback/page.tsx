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
import { Star, Search, MessageSquare, ArrowUpDown } from "lucide-react";
import { getTripFeedbacks, sendFeedbackResponse } from "@/actions";
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
import { Textarea } from "@/components/ui/textarea";

interface TripFeedback {
  id: string;
  tripId: string;
  userId: string;
  rating: number;
  review: string;
  suggestion: string | null;
  respondedByAdmin: boolean;
  createdAt: Date;
  adminResponse: string | null;
  trip: {
    tourName: string;
  };
  user: {
    name: string;
    email: string;
  };
}

type SortField = "tripName" | "userName" | "rating" | "createdAt" | "respondedByAdmin";
type SortOrder = "asc" | "desc";

export default function FeedbackPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [feedbacks, setFeedbacks] = useState<TripFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<TripFeedback | null>(null);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [responseText, setResponseText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const result = await getTripFeedbacks();
        if (result.success && result.feedbacks) {
          setFeedbacks(result.feedbacks.map(feedback => ({
            ...feedback,
            respondedByAdmin: feedback.respondedByAdmin ?? false
          })) as TripFeedback[]);
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

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredFeedbacks = feedbacks.filter((feedback) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      feedback.trip.tourName.toLowerCase().includes(searchTermLower) ||
      feedback.user.name.toLowerCase().includes(searchTermLower) ||
      feedback.review.toLowerCase().includes(searchTermLower) ||
      (feedback.suggestion?.toLowerCase().includes(searchTermLower) ?? false)
    );
  });

  const sortedFeedbacks = [...filteredFeedbacks].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "tripName":
        comparison = a.trip.tourName.localeCompare(b.trip.tourName);
        break;
      case "userName":
        comparison = (a.user.name || "").localeCompare(b.user.name || "");
        break;
      case "rating":
        comparison = a.rating - b.rating;
        break;
      case "createdAt":
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case "respondedByAdmin":
        comparison = (a.respondedByAdmin === b.respondedByAdmin) ? 0 : a.respondedByAdmin ? 1 : -1;
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
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

  const handleSendResponse = async (feedbackId: string) => {
    if (!responseText.trim()) {
      toast.error("Please enter a response");
      return;
    }

    setIsSending(true);
    try {
      const result = await sendFeedbackResponse(feedbackId, responseText);
      if (result.success && result.feedback) {
        setFeedbacks(feedbacks.map(feedback =>
          feedback.id === feedbackId ? {
            ...feedback,
            respondedByAdmin: true,
            adminResponse: responseText
          } : feedback
        ));
        toast.success("Response sent successfully");
        setResponseText("");
        setSelectedFeedback(null);
      } else {
        toast.error("Failed to send response");
      }
    } catch (error) {
      toast.error("An error occurred while sending response");
    } finally {
      setIsSending(false);
    }
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
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("tripName")}
                    className="flex items-center gap-1"
                  >
                    Trip
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("userName")}
                    className="flex items-center gap-1"
                  >
                    Customer
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("rating")}
                    className="flex items-center gap-1"
                  >
                    Rating
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Private Suggestion</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center gap-1"
                  >
                    Date
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("respondedByAdmin")}
                    className="flex items-center gap-1"
                  >
                    Status
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedFeedbacks.map((feedback) => (
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
                  <TableCell>
                    {feedback.respondedByAdmin ? (
                      <Badge className="bg-green-500 text-white">Responded</Badge>
                    ) : (
                      <Badge className="bg-red-500 text-white">Unresponded</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-200 hover:bg-slate-50"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Feedback Details</DialogTitle>
                            <DialogDescription>
                              Feedback from {feedback.user.name} for {feedback.trip.tourName}
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

                            {feedback.respondedByAdmin && feedback.adminResponse && (
                              <div>
                                <h4 className="font-medium mb-2">Your Response</h4>
                                <div className="text-sm bg-green-50 p-3 rounded border-l-4 border-green-200">
                                  <p className="text-green-800">{feedback.adminResponse}</p>
                                  <p className="text-xs text-green-600 mt-2">
                                    Sent on {format(new Date(feedback.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                                  </p>
                                </div>
                              </div>
                            )}

                            {!feedback.respondedByAdmin && (
                              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border-l-4 border-amber-200">
                                <p>No response has been sent yet.</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {!feedback.respondedByAdmin && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-slate-800 hover:bg-slate-700 text-white"
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Respond
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Respond to Feedback</DialogTitle>
                              <DialogDescription>
                                Add your response to the feedback from {feedback.user.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Original Feedback</h4>
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

                              <div>
                                <h4 className="font-medium mb-2">Your Response</h4>
                                <Textarea
                                  placeholder="Write your response to the customer..."
                                  className="min-h-[150px]"
                                  value={responseText}
                                  onChange={(e) => setResponseText(e.target.value)}
                                  disabled={isSending}
                                />
                                <div className="flex justify-end mt-4">
                                  <Button 
                                    className="bg-slate-800 hover:bg-slate-700 text-white"
                                    onClick={() => handleSendResponse(feedback.id)}
                                    disabled={isSending || !responseText.trim()}
                                  >
                                    {isSending ? "Sending..." : "Send Response"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
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
