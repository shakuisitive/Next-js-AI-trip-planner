import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
              About Travel Planner AI
            </h1>
            
            <div className="space-y-8">
              <section className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-blue-600 mb-4">Your Personal Travel Assistant</h2>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to Travel Planner AI, your intelligent companion for creating perfect travel experiences. 
                  We combine cutting-edge AI technology with personalized insights to craft travel plans that match 
                  your preferences and dreams.
                </p>
              </section>

              <section className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-blue-600 mb-4">Smart Features</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">Personalized Recommendations</h3>
                        <p className="mt-1 text-gray-600">Get travel suggestions based on your preferences, past trips, and interests.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">Weather Intelligence</h3>
                        <p className="mt-1 text-gray-600">Real-time weather data to help you plan the perfect time for your trip.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">AI Chatbot Assistant</h3>
                        <p className="mt-1 text-gray-600">24/7 support and guidance through our intelligent chatbot.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-medium text-gray-900">Easy Booking & Reviews</h3>
                        <p className="mt-1 text-gray-600">Seamless booking process and the ability to share your travel experiences.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-blue-600 mb-4">How It Works</h2>
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    1. Tell us about your travel preferences and past experiences
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    2. Our AI analyzes weather patterns, your history, and current trends
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    3. Receive personalized travel recommendations
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    4. Book your perfect trip with just a few clicks
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    5. Share your experience and help others plan their adventures
                  </p>
                </div>
              </section>

              <section className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold text-blue-600 mb-4">Start Your Journey</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                  Ready to experience the future of travel planning? Let our AI-powered platform help you discover 
                  your next adventure. Whether you're a seasoned traveler or planning your first trip, we're here 
                  to make your travel dreams come true.
                </p>
                <div className="text-center">
                  <a
                    href="/"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Start Planning Now
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
