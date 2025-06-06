"use client";

import { useRef, useEffect } from "react";
import { ChatHistory } from "@/types";
import { User, Bot } from "lucide-react";

interface MessageWindowProps {
  history: ChatHistory;
}

export default function MessageWindow({ history }: MessageWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);
  
  return (
    <div className="flex-1 p-3 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        {history.map((msg, index) => {
          const isUser = msg.role === "user";
          
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
                className={`
                  px-4 py-2 shadow-sm rounded-lg
                  ${isUser 
                    ? "bg-purple-600 text-white rounded-br-none" 
                    : "bg-white text-gray-800 rounded-bl-none"
                  }
                  max-w-xs sm:max-w-md
                `}
              >
                <div className="whitespace-pre-wrap break-words">
                  {msg.parts.map((part, idx) => (
                    <span key={idx}>{part.text}</span>
                  ))}
                </div>
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
    </div>
  );
}