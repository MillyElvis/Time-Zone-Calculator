import React, { useState, useMemo } from 'react';
import { Timezone } from '../types';
import { TIMEZONES } from '../constants';
import { PlusIcon } from './icons/PlusIcon';

interface TimezoneSelectorProps {
  onTimezoneAdd: (timezone: Timezone) => void;
  existingTimezones: Timezone[];
  isButton?: boolean;
}

export const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({ onTimezoneAdd, existingTimezones, isButton = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const availableTimezones = useMemo(() => {
    const existingIanas = new Set(existingTimezones.map(tz => tz.iana));
    return TIMEZONES
      .filter(tz => !existingIanas.has(tz.iana))
      .filter(tz => 
        tz.city.toLowerCase().includes(searchTerm.toLowerCase()) || 
        tz.country.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.city.localeCompare(b.city));
  }, [existingTimezones, searchTerm]);

  const handleSelect = (timezone: Timezone) => {
    onTimezoneAdd(timezone);
    setSearchTerm('');
    setIsOpen(false);
  };

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setSearchTerm('');
  };
  
  const triggerButtonClasses = isButton 
    ? "inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
    : "flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500";


  return (
    <>
      <button onClick={openModal} className={triggerButtonClasses}>
        <PlusIcon />
        Add Zone
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm" onClick={closeModal}>
          <div 
            className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md m-4 border border-slate-700" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <h3 className="text-lg font-medium leading-6 text-white">Find a Zone</h3>
              <div className="mt-4">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search for a city or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-80 border-t border-slate-700">
              {availableTimezones.length > 0 ? (
                <ul>
                  {availableTimezones.map(tz => (
                    <li key={tz.iana}>
                      <button 
                        onClick={() => handleSelect(tz)} 
                        className="w-full text-left px-5 py-3 hover:bg-slate-700/50 focus:bg-slate-700 focus:outline-none transition-colors"
                      >
                        <span className="font-medium text-slate-100">{tz.city}</span>
                        <span className="text-sm text-slate-400 ml-2">{tz.country}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-10 text-center text-slate-400">No matching timezones found.</p>
              )}
            </div>
            <div className="px-5 py-3 bg-slate-800/50 border-t border-slate-700 text-right">
                <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700 rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
                    onClick={closeModal}
                >
                    Close
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};