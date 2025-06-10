"use server";
import { signIn, auth } from "@/lib/auth";
import { prisma } from "./../lib/db/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function signInUsingGoogle() {
  let data = await signIn("google");
  let result = await auth();
  console.log(result);
}

export async function createAUser(userData: {
  name: string;
  email: string;
  password: string;
  role: string;
  status: boolean;
}) {
  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  let user = await prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });

  return "User created successfully";
}

export async function updateUserRoleAndStatus(
  userId: string,
  updates: { role?: string; status?: boolean }
) {
  try {
    const data: any = { ...updates };

    // If status is being updated, handle deletedAt accordingly
    if (updates.status !== undefined) {
      data.deletedAt = updates.status ? null : new Date();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: "Failed to update user" };
  }
}

export async function updateUserDetails(
  userId: string,
  updates: { name?: string; email?: string }
) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
    });
    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating user details:", error);
    return { success: false, error: "Failed to update user details" };
  }
}

export async function deleteUser(userId: string) {
  try {
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: false,
        deletedAt: new Date(),
      },
    });
    return { success: true, user: deletedUser };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

interface TripWithUser {
  id: string;
  tourName: string;
  destination: string;
  user: {
    name: string | null;
    email: string | null;
  } | null;
  startDate: Date;
  endDate: Date;
  tourStatus: string;
  status: boolean | null;
  budgetMin: number;
  budgetMax: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  userId: string;
}

export async function getTrips() {
  try {
    const trips = await prisma.trip.findMany({
      where: {
        status: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        days: {
          select: {
            dayNumber: true,
          },
          orderBy: {
            dayNumber: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      trips,
    };
  } catch (error) {
    console.error("Error fetching trips:", error);
    return {
      success: false,
      error: "Failed to fetch trips",
    };
  }
}

export async function updateTripDetails(
  tripId: string,
  updates: {
    tourName?: string;
    tourStatus?: string;
    startDate?: Date;
    endDate?: Date;
    budgetMin?: number;
    budgetMax?: number;
    status?: boolean;
  }
) {
  try {
    const data: any = { ...updates };

    // If status is being updated, handle deletedAt accordingly
    if (updates.status !== undefined) {
      data.deletedAt = updates.status ? null : new Date();
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return { success: true, trip: updatedTrip };
  } catch (error) {
    console.error("Error updating trip details:", error);
    return { success: false, error: "Failed to update trip details" };
  }
}

export async function getAllUsers() {
  try {
    const users = await prisma.user.findMany({
      where: {
        status: true,
        role: "user",
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function updateTripUser(tripId: string, userId: string) {
  try {
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: { userId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    return { success: true, trip: updatedTrip };
  } catch (error) {
    console.error("Error updating trip user:", error);
    return { success: false, error: "Failed to update trip user" };
  }
}

interface Accommodation {
  id: string;
  name: string;
  type: string;
  tripId: string;
  rating: number;
  pricePerNight: number;
  description: string;
  bookingUrl: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  status: boolean | null;
  trip: {
    tourName: string;
  };
  amenities: {
    name: string;
  }[];
}

export async function getAccommodations() {
  try {
    const accommodations = await prisma.accommodation.findMany({
      include: {
        trip: {
          select: {
            tourName: true,
          },
        },
        amenities: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, accommodations };
  } catch (error) {
    console.error("Error fetching accommodations:", error);
    return { success: false, error: "Failed to fetch accommodations" };
  }
}

export async function updateAccommodationDetails(
  accommodationId: string,
  updates: {
    name?: string;
    type?: string;
    rating?: number;
    pricePerNight?: number;
    description?: string;
    bookingUrl?: string;
    image?: string;
    status?: boolean;
  }
) {
  try {
    const data: any = { ...updates };

    // If status is being updated, handle deletedAt accordingly
    if (updates.status !== undefined) {
      data.deletedAt = updates.status ? null : new Date();
    }

    const updatedAccommodation = await prisma.accommodation.update({
      where: { id: accommodationId },
      data,
      include: {
        trip: {
          select: {
            tourName: true,
          },
        },
        amenities: {
          select: {
            name: true,
          },
        },
      },
    });
    return { success: true, accommodation: updatedAccommodation };
  } catch (error) {
    console.error("Error updating accommodation details:", error);
    return { success: false, error: "Failed to update accommodation details" };
  }
}

export async function updateAccommodationAmenities(
  accommodationId: string,
  amenities: string[]
) {
  try {
    // First, delete all existing amenities
    await prisma.accommodationAmenity.deleteMany({
      where: { accommodationId },
    });

    // Then, create new amenities
    const createdAmenities = await Promise.all(
      amenities.map((name) =>
        prisma.accommodationAmenity.create({
          data: {
            name,
            accommodationId,
          },
        })
      )
    );

    const updatedAccommodation = await prisma.accommodation.findUnique({
      where: { id: accommodationId },
      include: {
        trip: {
          select: {
            tourName: true,
          },
        },
        amenities: {
          select: {
            name: true,
          },
        },
      },
    });

    return { success: true, accommodation: updatedAccommodation };
  } catch (error) {
    console.error("Error updating accommodation amenities:", error);
    return {
      success: false,
      error: "Failed to update accommodation amenities",
    };
  }
}

export async function deleteAccommodation(accommodationId: string) {
  try {
    const deletedAccommodation = await prisma.accommodation.update({
      where: { id: accommodationId },
      data: {
        status: false,
        deletedAt: new Date(),
      },
    });
    return { success: true, accommodation: deletedAccommodation };
  } catch (error) {
    console.error("Error deleting accommodation:", error);
    return { success: false, error: "Failed to delete accommodation" };
  }
}

export async function updateAccommodationTrip(
  accommodationId: string,
  tripId: string
) {
  try {
    const updatedAccommodation = await prisma.accommodation.update({
      where: { id: accommodationId },
      data: { tripId },
      include: {
        trip: {
          select: {
            tourName: true,
          },
        },
        amenities: {
          select: {
            name: true,
          },
        },
      },
    });
    return { success: true, accommodation: updatedAccommodation };
  } catch (error) {
    console.error("Error updating accommodation trip:", error);
    return { success: false, error: "Failed to update accommodation trip" };
  }
}

export async function createAccommodation(data: {
  name: string;
  type: string;
  tripId: string;
  rating: number;
  pricePerNight: number;
  description: string;
  bookingUrl?: string;
  image?: string;
  amenities: string[];
}) {
  try {
    const accommodation = await prisma.accommodation.create({
      data: {
        name: data.name,
        type: data.type,
        tripId: data.tripId,
        rating: data.rating,
        pricePerNight: data.pricePerNight,
        description: data.description,
        bookingUrl: data.bookingUrl,
        image: data.image,
        status: true,
        amenities: {
          create: data.amenities.map((name) => ({ name })),
        },
      },
      include: {
        trip: {
          select: {
            tourName: true,
          },
        },
        amenities: {
          select: {
            name: true,
          },
        },
      },
    });
    return { success: true, accommodation };
  } catch (error) {
    console.error("Error creating accommodation:", error);
    return { success: false, error: "Failed to create accommodation" };
  }
}

export async function getPlaces() {
  try {
    const places = await prisma.place.findMany({
      where: {
        status: true,
      },
      include: {
        day: {
          include: {
            trip: {
              select: {
                id: true,
                tourName: true,
              },
            },
          },
        },
        restaurant: true,
        attraction: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      places,
    };
  } catch (error) {
    console.error("Error fetching places:", error);
    return {
      success: false,
      error: "Failed to fetch places",
    };
  }
}

export async function createPlace({
  name,
  type,
  description,
  location,
  timeOfDay,
  duration,
  image,
  tripId,
  dayNumber,
  cuisine = "",
  priceRange = "",
  category = "",
}: {
  name: string;
  type: "attraction" | "restaurant";
  description: string;
  location: string;
  timeOfDay: string;
  duration: string;
  image: string;
  tripId: string;
  dayNumber: number;
  cuisine?: string;
  priceRange?: string;
  category?: string;
}) {
  try {
    // First, find or create the day
    const existingDay = await prisma.day.findFirst({
      where: {
        tripId,
        dayNumber,
      },
    });

    let dayId;
    if (existingDay) {
      dayId = existingDay.id;
    } else {
      const newDay = await prisma.day.create({
        data: {
          tripId,
          dayNumber,
          date: new Date(),
        },
      });
      dayId = newDay.id;
    }

    // Create the place
    const place = await prisma.place.create({
      data: {
        name,
        type,
        description,
        location,
        timeOfDay,
        duration,
        image,
        dayId,
        ...(type === "restaurant" && {
          restaurant: {
            create: {
              cuisine,
              priceRange,
            },
          },
        }),
        ...(type === "attraction" && {
          attraction: {
            create: {
              category,
            },
          },
        }),
      },
      include: {
        day: {
          include: {
            trip: {
              select: {
                id: true,
                tourName: true,
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      place,
    };
  } catch (error) {
    console.error("Error creating place:", error);
    return {
      success: false,
      error: "Failed to create place",
    };
  }
}

export async function updatePlaceDetails(placeId: string, updates: any) {
  try {
    // If updating day number, we need to handle it differently
    if (updates.dayNumber) {
      // First get the current place to get the tripId
      const currentPlace = await prisma.place.findUnique({
        where: { id: placeId },
        include: {
          day: {
            include: {
              trip: true,
            },
          },
        },
      });

      if (!currentPlace) {
        throw new Error("Place not found");
      }

      // Find or create the new day
      const existingDay = await prisma.day.findFirst({
        where: {
          tripId: currentPlace.day.trip.id,
          dayNumber: updates.dayNumber,
        },
      });

      let newDayId;
      if (existingDay) {
        newDayId = existingDay.id;
      } else {
        const newDay = await prisma.day.create({
          data: {
            tripId: currentPlace.day.trip.id,
            dayNumber: updates.dayNumber,
            date: new Date(),
          },
        });
        newDayId = newDay.id;
      }

      // Update the place with the new dayId
      const place = await prisma.place.update({
        where: {
          id: placeId,
        },
        data: {
          dayId: newDayId,
        },
        include: {
          day: {
            include: {
              trip: {
                select: {
                  id: true,
                  tourName: true,
                },
              },
            },
          },
          restaurant: true,
          attraction: true,
        },
      });

      return {
        success: true,
        place,
      };
    }

    // For all other updates
    const place = await prisma.place.update({
      where: {
        id: placeId,
      },
      data: updates,
      include: {
        day: {
          include: {
            trip: {
              select: {
                id: true,
                tourName: true,
              },
            },
          },
        },
        restaurant: true,
        attraction: true,
      },
    });

    return {
      success: true,
      place,
    };
  } catch (error) {
    console.error("Error updating place:", error);
    return {
      success: false,
      error: "Failed to update place",
    };
  }
}

export async function deletePlace(placeId: string) {
  try {
    await prisma.place.update({
      where: {
        id: placeId,
      },
      data: {
        status: false,
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting place:", error);
    return {
      success: false,
      error: "Failed to delete place",
    };
  }
}

export async function getTripFeedbacks() {
  try {
    const feedbacks = await prisma.tripFeedback.findMany({
      include: {
        trip: {
          select: {
            id: true,
            tourName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      feedbacks: feedbacks.map(feedback => ({
        ...feedback,
        respondedByAdmin: feedback.respondedByAdmin ?? false,
        adminResponse: feedback.adminResponse ?? null
      }))
    }
  } catch (error) {
    console.error("Error fetching feedbacks:", error)
    return {
      success: false,
      error: "Failed to fetch feedbacks",
    }
  }
}

export async function sendFeedbackResponse(feedbackId: string, response: string) {
  try {
    // Get the feedback with user and trip details
    const feedback = await prisma.tripFeedback.findUnique({
      where: { id: feedbackId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
        trip: {
          select: {
            tourName: true,
          },
        },
      },
    })

    if (!feedback || !feedback.user.email) {
      throw new Error("Feedback or user email not found")
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bloggingmotive@gmail.com",
        pass: "ddztujeipvegvqft",
      },
    })

    // Create email template
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1a1a1a;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 0 0 5px 5px;
            }
            .section {
              margin-bottom: 20px;
              padding: 15px;
              background-color: white;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .section-title {
              color: #1a1a1a;
              font-size: 18px;
              margin-bottom: 10px;
              font-weight: bold;
            }
            .rating {
              color: #f59e0b;
              font-size: 16px;
            }
            .response {
              background-color: #e8f5e9;
              padding: 15px;
              border-left: 4px solid #4caf50;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Response to Your Feedback</h1>
          </div>
          <div class="content">
            <div class="section">
              <div class="section-title">Trip Details</div>
              <p>Trip: ${feedback.trip.tourName}</p>
            </div>

            <div class="section">
              <div class="section-title">Your Feedback</div>
              <div class="rating">
                ${"★".repeat(feedback.rating)}${"☆".repeat(5 - feedback.rating)}
                (${feedback.rating}/5)
              </div>
              <p>${feedback.review}</p>
            </div>

            ${feedback.suggestion ? `
              <div class="section">
                <div class="section-title">Your Private Suggestion</div>
                <p>${feedback.suggestion}</p>
              </div>
            ` : ''}

            <div class="response">
              <div class="section-title">Our Response</div>
              <p>${response}</p>
            </div>

            <div class="footer">
              <p>Thank you for your valuable feedback!</p>
              <p>Best regards,<br>The Travel Team</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email
    await transporter.sendMail({
      from: "bloggingmotive@gmail.com",
      to: feedback.user.email,
      subject: `Response to your feedback for ${feedback.trip.tourName}`,
      html: emailTemplate,
    })

    // Update feedback status and store response
    const updatedFeedback = await prisma.tripFeedback.update({
      where: { id: feedbackId },
      data: { 
        respondedByAdmin: true,
        adminResponse: response
      },
      include: {
        trip: {
          select: {
            id: true,
            tourName: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return {
      success: true,
      feedback: {
        ...updatedFeedback,
        respondedByAdmin: true,
        adminResponse: response
      }
    }
  } catch (error) {
    console.error("Error sending feedback response:", error)
    return {
      success: false,
      error: "Failed to send response",
    }
  }
}

export async function getSessions() {
  try {
    const sessions = await prisma.session.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, sessions };
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return { success: false, error: "Failed to fetch sessions" };
  }
}

export async function deleteSession(sessionId: string) {
  try {
    await prisma.session.delete({
      where: { id: sessionId },
    });
    return { success: true };
  } catch (error) {
    console.error("Error deleting session:", error);
    return { success: false, error: "Failed to delete session" };
  }
}

export async function updateSessionExpires(sessionId: string, expires: Date) {
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: { expires },
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating session expires:", error);
    return { success: false, error: "Failed to update session expires" };
  }
}

export async function sendContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  try {
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "bloggingmotive@gmail.com",
        pass: "ddztujeipvegvqft",
      },
    });

    // Create email template
    const emailTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #1a1a1a;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 0 0 5px 5px;
            }
            .section {
              margin-bottom: 20px;
              padding: 15px;
              background-color: white;
              border-radius: 5px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .section-title {
              color: #1a1a1a;
              font-size: 18px;
              margin-bottom: 10px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="section">
              <div class="section-title">Contact Information</div>
              <p><strong>Name:</strong> ${data.name}</p>
              <p><strong>Email:</strong> ${data.email}</p>
            </div>

            <div class="section">
              <div class="section-title">Message Details</div>
              <p><strong>Subject:</strong> ${data.subject}</p>
              <p><strong>Message:</strong></p>
              <p>${data.message}</p>
            </div>

            <div class="footer">
              <p>This message was sent from the contact form on TripFusion.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: "bloggingmotive@gmail.com",
      to: "shakirkhan72727@gmail.com", // Updated email address
      subject: `New Contact Form Submission: ${data.subject}`,
      html: emailTemplate,
      replyTo: data.email,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error sending contact message:", error);
    return {
      success: false,
      error: "Failed to send message",
    };
  }
}
