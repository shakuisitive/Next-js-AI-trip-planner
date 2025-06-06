import { FileText } from "lucide-react";

interface SystemInstructionProps {
    instruction: string;
    onChange: (value: string) => void;
  }
  
  export default function SystemInstruction({ instruction, onChange }: SystemInstructionProps) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FileText size={16} className="text-purple-500" />
          <label className="text-sm font-medium">System Instruction</label>
        </div>
        <textarea 
          value={instruction} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          rows={3} 
          placeholder="Add system instructions..."
        />
      </div>
    );
  }