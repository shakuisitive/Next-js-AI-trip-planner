"use client";

import { useRef, useEffect } from "react";
import { Message } from "@/components/Chatbot";
import { User, Bot } from "lucide-react";

interface MessageWindowProps {
  history: Message[];
}

export default function MessageWindow({ history }: MessageWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  return (
    <div className="flex flex-col space-y-4 py-4 px-8">
      {history.map((message, index) => {
        const isUser = message.role === "user";

        return (
          <div
            key={index}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
          >
            {/* For bot messages, avatar appears first */}
            {!isUser && (
              <div className="mr-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300">
                  <Bot size={16} className="text-gray-700" />
                </div>
              </div>
            )}

            {/* Message bubble */}
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                isUser
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.parts.map((part, partIndex) => (
                <p key={partIndex} className="whitespace-pre-wrap">
                  {part.text}
                </p>
              ))}
            </div>

            {/* For user messages, avatar appears last */}
            {isUser && (
              <div className="ml-2">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500">
                  <User size={16} className="text-white" />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Invisible element to help scroll to bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
}
