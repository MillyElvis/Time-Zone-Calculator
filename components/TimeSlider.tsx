import React, { useCallback } from 'react';

interface TimeSliderProps {
  referenceTime: Date;
  onTimeChange: (newDate: Date) => void;
  onReset: () => void;
  isPlanning: boolean;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({ referenceTime, onTimeChange, onReset, isPlanning }) => {
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(referenceTime);
    const [year, month, day] = e.target.value.split('-').map(Number);
    newDate.setFullYear(year, month - 1, day);
    onTimeChange(newDate);
  }, [referenceTime, onTimeChange]);

  const handleTimeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(referenceTime);
    const totalMinutes = parseInt(e.target.value, 10);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    newDate.setHours(hours, minutes);
    onTimeChange(newDate);
  }, [referenceTime, onTimeChange]);
  
  const totalMinutesInDay = referenceTime.getHours() * 60 + referenceTime.getMinutes();
  const dateValue = referenceTime.toISOString().split('T')[0];

  return (
    <div className="p-6 bg-slate-800/60 border border-slate-700 rounded-2xl shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-grow w-full md:w-auto">
          <div className="flex items-center justify-between mb-2">
              <label htmlFor="time-slider" className="text-sm font-medium text-slate-300">
                Time Warp
              </label>
              <span className="text-2xl font-mono text-white tracking-wider">
                {referenceTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
          </div>
          <input
            id="time-slider"
            type="range"
            min="0"
            max="1439"
            step="15"
            value={totalMinutesInDay}
            onChange={handleTimeChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:bg-indigo-400"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
            <input
                type="date"
                value={dateValue}
                onChange={handleDateChange}
                className="bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
                onClick={onReset}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500
                    ${isPlanning 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                disabled={!isPlanning}
            >
                Sync to Now
            </button>
        </div>
      </div>
    </div>
  );
};