import React, { useMemo } from 'react';
import { Timezone, Weather } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { SunIcon } from './icons/SunIcon';
import { CloudIcon } from './icons/CloudIcon';
import { RainIcon } from './icons/RainIcon';

interface ClockCardProps {
  timezone: Timezone;
  referenceTime: Date;
  onRemove: (iana: string) => void;
  isLocal: boolean;
  weather?: Weather;
}

const WeatherIcon: React.FC<{ condition: Weather['condition']; className?: string }> = ({ condition, className }) => {
    switch (condition) {
        case 'Sunny':
            return <SunIcon className={className} />;
        case 'Cloudy':
        case 'Partly Cloudy':
            return <CloudIcon className={className} />;
        case 'Rainy':
            return <RainIcon className={className} />;
        default:
            return null;
    }
};

export const ClockCard: React.FC<ClockCardProps> = ({ timezone, referenceTime, onRemove, isLocal, weather }) => {
  const timeData = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone.iana,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const dateParts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone.iana,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).formatToParts(referenceTime);

    const timeString = formatter.format(referenceTime);
    const [hour, minute] = timeString.split(':');
    
    const weekday = dateParts.find(p => p.type === 'weekday')?.value;
    const day = dateParts.find(p => p.type === 'day')?.value;
    const month = dateParts.find(p => p.type === 'month')?.value;

    const offsetFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone.iana,
        timeZoneName: 'shortOffset',
    });
    const gmtOffset = offsetFormatter.formatToParts(referenceTime).find(p => p.type === 'timeZoneName')?.value;

    const nameFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone.iana,
        timeZoneName: 'short',
    });
    const tzName = nameFormatter.formatToParts(referenceTime).find(p => p.type === 'timeZoneName')?.value;
    
    const hourNum = parseInt(hour, 10);
    const isDayTime = hourNum >= 6 && hourNum < 18;

    const localDate = new Date(referenceTime.toLocaleString('en-US', { timeZone: timezone.iana }));
    const today = new Date();
    today.setHours(0,0,0,0);
    const cardDate = new Date(localDate);
    cardDate.setHours(0,0,0,0);

    let dayRelation = 'Today';
    const diff = cardDate.getTime() - today.getTime();
    if (diff > 0) dayRelation = 'Tomorrow';
    else if (diff < 0) dayRelation = 'Yesterday';


    return { hour, minute, weekday, day, month, gmtOffset, tzName, isDayTime, dayRelation };
  }, [referenceTime, timezone.iana]);

  const dayBg = isLocal ? 'bg-amber-400/30 border-2 border-amber-400' : 'bg-amber-300/20 border border-amber-500 hover:border-amber-400';
  const nightBg = isLocal ? 'bg-indigo-900/50 border-2 border-indigo-600' : 'bg-blue-900/40 border border-blue-700 hover:border-blue-600';
  const cardClasses = `relative p-4 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-3 ${timeData.isDayTime ? dayBg : nightBg}`;
  
  const timeZoneDisplay = timeData.tzName && timeData.gmtOffset && timeData.tzName !== timeData.gmtOffset
    ? `${timeData.tzName} (${timeData.gmtOffset})`
    : timeData.gmtOffset || timeData.tzName;

  const badgeClasses = isLocal 
    ? (timeData.isDayTime ? 'bg-amber-500 text-amber-900' : 'bg-indigo-500 text-white') 
    : 'bg-slate-700 text-slate-300';

  return (
    <div className={cardClasses}>
      <button 
        onClick={() => onRemove(timezone.iana)}
        className="absolute top-2 right-2 p-1.5 rounded-full text-slate-400 hover:bg-white/10 hover:text-slate-100 transition-colors"
        aria-label={`Remove ${timezone.city}`}
      >
        <TrashIcon />
      </button>

      {/* Weather Section */}
      <div className="flex flex-col items-center justify-center w-14 text-center flex-shrink-0">
        {weather ? (
            <>
                <WeatherIcon condition={weather.condition} className={`w-8 h-8 ${weather.condition === 'Sunny' ? 'text-amber-400' : 'text-slate-300'}`} />
                <div className="mt-1 font-bold text-white">
                    <span className="text-xl">{weather.temperature}</span>
                    <span className="text-xs align-top">°C</span>
                </div>
            </>
        ) : (
            <div className="w-12 h-12 rounded-lg bg-white/5 animate-pulse"></div>
        )}
      </div>

      {/* Time Info Section */}
      <div className="flex-grow pl-3 border-l border-white/10 min-w-0">
        <div className="flex justify-between items-baseline">
            <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{timezone.city}</h2>
                <p className="text-xs text-slate-400 truncate">{timezone.country}</p>
            </div>
            <div className="text-2xl font-mono tracking-tighter text-white flex-shrink-0 pl-2">
                <span>{timeData.hour}</span>
                <span className="animate-pulse">:</span>
                <span>{timeData.minute}</span>
            </div>
        </div>
        <div className="mt-2 flex justify-between items-baseline text-xs">
            <div className="font-medium text-slate-300 truncate">
                {timeData.weekday}, {timeData.month} {timeData.day} <span className="text-slate-400 hidden sm:inline">({timeData.dayRelation})</span>
            </div>
            <span className={`font-semibold px-2 py-0.5 rounded-full text-xs flex-shrink-0 ${badgeClasses}`}>
                {timeZoneDisplay}
            </span>
        </div>
      </div>
    </div>
  );
};