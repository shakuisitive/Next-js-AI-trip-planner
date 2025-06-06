"use client";

import { useEffect, useState } from "react";
import ChatInput from "@/components/ui/ChatInput";
import MessageWindow from "@/components/ui/MessageWindow";
import SettingsModal from "@/components/ui/SettingsModal";

export type MessageRole = "user" | "model";

export interface MessagePart {
  text: string;
}

export interface Message {
  role: MessageRole;
  parts: MessagePart[];
}

export interface ChatHistory extends Array<Message> {}

export interface GenerationConfig {
  temperature: number;
  topP: number;
  responseMimeType: string;
}

export interface ChatSettings {
  temperature: number;
  model: string;
  systemInstruction: string;
}

export default function Chatbot({
  weather,
  inputData,
  generatedTours,
  pastTours,
}: {
  weather: any;
  inputData: any;
  generatedTours: any;
  pastTours: any;
}) {
  console.log("1 13 - weather", weather);
  console.log("1 13 - inputData", inputData);
  console.log("1 13 - generatedTours", generatedTours);
  console.log("1 13 - pastTours", pastTours);

  let pastToursString = "";
  if (pastTours?.length > 0) {
    pastToursString = `Here is user last 5 history data. ${JSON.stringify(
      pastTours
    )}`;
  }

  const [history, setHistory] = useState<ChatHistory>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

    ${pastToursString || ""}



      `,
  });

  useEffect(() => {
    console.log("running");
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
  
  
  
        `,
    });
  }, [weather, inputData, generatedTours, pastTours]);

  const handleSend = async (message: string) => {
    const newUserMessage: Message = {
      role: "user" as MessageRole,
      parts: [{ text: message }],
    };

    const updatedHistory = [...history, newUserMessage];
    setHistory(updatedHistory);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: message,
          history: updatedHistory,
          settings: settings,
        }),
      });

      const data = await response.json();

      if (data.error) {
        console.error("AI Error:", data.error);
        return;
      }

      const aiMessage: Message = {
        role: "model" as MessageRole,
        parts: [{ text: data.response }],
      };

      setHistory([...updatedHistory, aiMessage]);
    } catch (error) {
      console.error("Request Failed:", error);
    }
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  const handleCloseSettings = () => {
    setIsSettingsOpen(false);
  };

  const handleSaveSettings = (newSettings: ChatSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="flex flex-col py-32">
      <MessageWindow history={history} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleCloseSettings}
        onSave={handleSaveSettings}
        currentSettings={settings}
      />
      <ChatInput onSend={handleSend} onOpenSettings={handleOpenSettings} />
    </div>
  );
}
