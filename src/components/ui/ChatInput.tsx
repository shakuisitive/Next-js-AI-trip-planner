//geminiclone/src/components/ui/ChatInput.tsx
"use client";
import { useState } from "react";
import { Settings, Send, X } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onOpenSettings: () => void;
}

export default function ChatInput({ onSend, onOpenSettings }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleClear = () => {
    setMessage("");
  };

  return (
    <div className="w-full border-t border-gray-200 bg-white">
      <div
        className={`
          flex items-center p-3
          bg-white 
          shadow-sm
        `}
      >
        {/* Input wrapper */}
        <div className="relative flex-1 mx-2">
          <textarea
            className="w-full px-3 py-2 bg-transparent border-none focus:outline-none resize-none"
            placeholder="Type a message..."
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
          />

          {/* Clear button - only show when text is present */}
          {message && (
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              onClick={handleClear}
              aria-label="Clear input"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Action buttons container */}
        <div className="flex items-center">
          {/* Send button - changes appearance based on whether there's a message */}
          <button
            className={`
              p-2 rounded-full transition-all
              ${
                message.trim()
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }
            `}
            onClick={handleSend}
            disabled={!message.trim()}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
