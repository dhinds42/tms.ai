import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export default function PostToLoadBoardsModal({ load, onClose, onPost }) {
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [rate, setRate] = useState(load.carrier_pay || "");

  const loadBoards = [
    { id: 'dat', name: 'DAT Load Board', icon: '🎯' },
    { id: '123loadboard', name: '123Loadboard', icon: '📋' },
    { id: 'truckstop', name: 'Truckstop.com', icon: '🚛' },
    { id: 'direct_freight', name: 'Direct Freight', icon: '📦' },
    { id: 'getloaded', name: 'GetLoaded', icon: '🔄' }
  ];

  const handleToggleBoard = (boardId) => {
    setSelectedBoards(prev =>
      prev.includes(boardId)
        ? prev.filter(id => id !== boardId)
        : [...prev, boardId]
    );
  };

  const handlePost = () => {
    onPost({
      load_id: load.id,
      boards: selectedBoards,
      posted_rate: parseFloat(rate)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Post Load to Load Boards</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-slate-600">
              Load: <span className="font-semibold">{load.load_number || `LOAD-${load.id.slice(0, 8)}`}</span>
            </p>
            <p className="text-slate-600 mt-1">
              Route: <span className="font-semibold">
                {load.pickup_location?.city}, {load.pickup_location?.state} → {load.dropoff_location?.city}, {load.dropoff_location?.state}
              </span>
            </p>
            <p className="text-slate-600 mt-1">
              Equipment: <span className="font-semibold capitalize">{load.equipment_type?.replace('_', ' ')}</span>
            </p>
          </div>

          <div>
            <Label htmlFor="rate">Posted Rate (Carrier Pay)</Label>
            <Input
              id="rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Enter rate to offer carriers"
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Select Load Boards</Label>
            <div className="space-y-3">
              {loadBoards.map(board => (
                <label
                  key={board.id}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedBoards.includes(board.id)
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedBoards.includes(board.id)}
                    onChange={() => handleToggleBoard(board.id)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                  <span className="text-2xl">{board.icon}</span>
                  <span className="font-medium text-slate-900">{board.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> Your load will be posted to the selected load boards with the specified rate. 
              Carriers can contact you directly through the platform.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handlePost}
            disabled={selectedBoards.length === 0 || !rate}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
          >
            Post Load
          </Button>
        </div>
      </div>
    </div>
  );
}