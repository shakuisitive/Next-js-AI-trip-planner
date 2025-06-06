//geminiclone/src/components/ui/SettingsModal/index.tsx
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import ModelSelector from "./ModelSelector";
import SystemInstruction from "./SystemInstruction";
import TemperatureSlider from "./TemperatureSlider";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: Settings) => void;
    currentSettings: Settings;
  }


  interface Settings {
    temperature: number;
    model: string;
    systemInstruction: string;
  }
// Main Settings Modal Component
export default function SettingsModal({
    isOpen, onClose, onSave, currentSettings
  }: SettingsModalProps) {
    const [settings, setSettings] = useState<Settings>({
      temperature: currentSettings.temperature,
      model: currentSettings.model,
      systemInstruction: currentSettings.systemInstruction
    });
    
    // Reset settings when modal opens
    useEffect(() => {
      if (isOpen) {
        setSettings({
          temperature: currentSettings.temperature,
          model: currentSettings.model,
          systemInstruction: currentSettings.systemInstruction
        });
      }
      
      // Handle escape key press
      const handleEscKey = (e: KeyboardEvent) => { 
        if (isOpen && e.key === "Escape") onClose(); 
      };
      
      window.addEventListener("keydown", handleEscKey);
      return () => window.removeEventListener("keydown", handleEscKey);
    }, [isOpen, currentSettings, onClose]);
    
    if (!isOpen) return null;
    
    // Update handlers
    const updateTemperature = (value: number) => {
      setSettings(prev => ({ ...prev, temperature: value }));
    };
    
    const updateModel = (modelId: string) => {
      setSettings(prev => ({ ...prev, model: modelId }));
    };
    
    const updateSystemInstruction = (value: string) => {
      setSettings(prev => ({ ...prev, systemInstruction: value }));
    };
    
    return (
      <div 
        className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-medium">Settings</h2>
            <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>
          
          <div className="p-4 max-h-[70vh] overflow-y-auto space-y-5">
            <TemperatureSlider 
              temperature={settings.temperature} 
              onChange={updateTemperature} 
            />
            
            <ModelSelector 
              model={settings.model} 
              onChange={updateModel} 
            />
            
            <SystemInstruction 
              instruction={settings.systemInstruction} 
              onChange={updateSystemInstruction} 
            />
          </div>
          
          <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
            <button 
              onClick={onClose} 
              className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              onClick={() => { onSave(settings); onClose(); }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }