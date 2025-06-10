"use client";

import { useEffect, useState, useRef } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

export type MessageRole = "user" | "model";

export interface MessagePart {
  text: string;
}

export interface Message {
  role: MessageRole;
  parts: MessagePart[];
}

export interface ChatHistory extends Array<Message> {}

export interface ChatSettings {
  temperature: number;
  model: string;
  systemInstruction: string;
}

interface ChatbotProps {
  weather: any;
  inputData: any;
  generatedTours: any;
  pastTours: any;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function Chatbot({
  weather,
  inputData,
  generatedTours,
  pastTours,
}: ChatbotProps) {
  const [history, setHistory] = useState<ChatHistory>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  let pastToursString = "";
  if (pastTours?.length > 0) {
    pastToursString = `Here is user last 5 history data. ${JSON.stringify(
      pastTours
    )}`;
  }

  const [settings, setSettings] = useState<ChatSettings>({
    temperature: 1,
    model: "gemini-1.5-flash",
    systemInstruction: `you are a helpful assistant that guides people about tours and trips.

      Here's what we know so you can use these information (if you find helpful) to answer people.

      destination, start and end date, minimum and maximum budget (essentially the range this user is willing to spend on this trip), we have interests, the pace of the tour, and of course the traveling style.
      ${JSON.stringify(inputData, null, 2)}

    Below is the weather report: 

    ${weather || "No weather data available"}

    Keeping these things in mind, we have suggested these:

    ${JSON.stringify(generatedTours, null, 2)}

    ${pastToursString || ""}`,
  });

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("");

        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    setSettings({
      temperature: 1,
      model: "gemini-1.5-flash",
      systemInstruction: `you are a helpful assistant that guides people about tours and trips.
  
        Here's what we know so you can use these information (if you find helpful) to answer people.
  
        destination, start and end date, minimum and maximum budget (essentially the range this user is willing to spend on this trip), we have interests, the pace of the tour, and of course the traveling style.
        ${JSON.stringify(inputData, null, 2)}
  
      Below is the weather report: 
  
      ${weather || "No weather data available"}
  
      Keeping these things in mind, we have suggested these:
  
      ${JSON.stringify(generatedTours, null, 2)}
  
      ${pastToursString || ""}
      
      Finally, dont write hundreds of words of replies. Short and sweet that conveys the message and helps the user. Dont use any bold or stars as well.
      `,
    });
  }, [weather, inputData, generatedTours, pastTours]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening(!isListening);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      parts: [{ text: input.trim() }],
    };

    const updatedHistory = [...history, userMessage];
    setHistory(updatedHistory);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: input.trim(),
          history: updatedHistory,
          settings: settings,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("AI Error:", data.error);
        toast.error("Failed to get response");
        return;
      }

      const aiMessage: Message = {
        role: "model",
        parts: [{ text: data.response }],
      };

      setHistory([...updatedHistory, aiMessage]);
    } catch (error) {
      console.error("Request Failed:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.parts[0].text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleListening}
            className={`${
              isListening ? "bg-red-100 text-red-600" : "bg-gray-100"
            } hover:bg-gray-200`}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {isListening && (
          <p className="text-sm text-gray-500 mt-2">
            Speak now... Click the microphone icon again to stop
          </p>
        )}
      </div>
    </div>
  );
}
