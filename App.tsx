import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Timezone, Weather } from './types';
import { TIMEZONES } from './constants';
import { ClockCard } from './components/ClockCard';
import { TimeSlider } from './components/TimeSlider';
import { TimezoneSelector } from './components/TimezoneSelector';
import { PlusIcon } from './components/icons/PlusIcon';

const mockFetchWeather = async (lat: number, lon: number): Promise<Weather> => {
  // Simulate API delay
  await new Promise(res => setTimeout(res, Math.random() * 800 + 200));
  const conditions: Weather['condition'][] = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'];
  // A very basic mock logic: temperature slightly depends on latitude
  const baseTemp = 20 - (Math.abs(lat) / 10);
  return {
    temperature: Math.floor(baseTemp + Math.random() * 10 - 5), // base temp with some variance
    condition: conditions[Math.floor(Math.random() * conditions.length)],
  };
};


const App: React.FC = () => {
  const [selectedTimezones, setSelectedTimezones] = useState<Timezone[]>([]);
  const [referenceTime, setReferenceTime] = useState<Date>(new Date());
  const [isPlanning, setIsPlanning] = useState(false);
  const [weatherData, setWeatherData] = useState<Record<string, Weather>>({});
  const [globeLongitude, setGlobeLongitude] = useState<number>(-74.00); // Default to New York

  useEffect(() => {
    const savedTimezonesJson = localStorage.getItem('world_clock_timezones');
    if (savedTimezonesJson) {
      const savedTimezones: Timezone[] = JSON.parse(savedTimezonesJson);
      setSelectedTimezones(savedTimezones);
      if (savedTimezones.length > 0) {
          setGlobeLongitude(savedTimezones[savedTimezones.length - 1].lon);
      }
    } else {
      const localTzIana = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const defaultTz = TIMEZONES.find(tz => tz.iana === localTzIana) || TIMEZONES.find(tz => tz.iana === 'America/New_York');
      if (defaultTz) {
        setSelectedTimezones([defaultTz]);
        setGlobeLongitude(defaultTz.lon);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedTimezones.length > 0) {
      localStorage.setItem('world_clock_timezones', JSON.stringify(selectedTimezones));
      
      const fetchAllWeather = async () => {
        const timezonesToFetch = selectedTimezones.filter(tz => !weatherData[tz.iana]);
        if (timezonesToFetch.length === 0) return;

        const weatherPromises = timezonesToFetch.map(tz =>
          mockFetchWeather(tz.lat, tz.lon).then(weather => ({ iana: tz.iana, weather }))
        );
        const results = await Promise.all(weatherPromises);
        const newWeatherData = results.reduce((acc, { iana, weather }) => {
          acc[iana] = weather;
          return acc;
        }, {} as Record<string, Weather>);
        setWeatherData(prev => ({ ...prev, ...newWeatherData }));
      };
      fetchAllWeather();
    }
  }, [selectedTimezones, weatherData]);

  useEffect(() => {
    let timerId: number;
    if (!isPlanning) {
      timerId = window.setInterval(() => {
        setReferenceTime(new Date());
      }, 1000);
    }
    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isPlanning]);

  const handleTimezoneAdd = useCallback((timezone: Timezone) => {
    if (!selectedTimezones.some(tz => tz.iana === timezone.iana)) {
      setSelectedTimezones(prev => [...prev, timezone]);
      setGlobeLongitude(timezone.lon);
    }
  }, [selectedTimezones]);

  const handleTimezoneRemove = useCallback((iana: string) => {
    setSelectedTimezones(prev => prev.filter(tz => tz.iana !== iana));
    setWeatherData(prev => {
        const newWeather = {...prev};
        delete newWeather[iana];
        return newWeather;
    });
  }, []);

  const handleSliderChange = useCallback((newDate: Date) => {
    if (!isPlanning) setIsPlanning(true);
    setReferenceTime(newDate);
  }, [isPlanning]);

  const resetToNow = useCallback(() => {
    setIsPlanning(false);
    setReferenceTime(new Date());
  }, []);

  const localTimezoneIana = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  const globeBgPosition = useMemo(() => {
    // Maps longitude (-180 to 180) to a background-position percentage (100% to 0%)
    const bgPercent = (-5 / 18) * globeLongitude + 50;
    return `${bgPercent}% center`;
  }, [globeLongitude]);

  return (
    <div className="relative min-h-screen font-sans overflow-hidden">
      {/* Globe Background */}
      <div 
        className="absolute inset-0 bg-cover bg-no-repeat transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: 'url(https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg)',
          backgroundPosition: globeBgPosition,
        }}
      ></div>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"></div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen text-slate-200 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-0">
              Timezone Vibe Check
            </h1>
            <TimezoneSelector onTimezoneAdd={handleTimezoneAdd} existingTimezones={selectedTimezones} />
          </header>

          <main>
            {selectedTimezones.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {selectedTimezones.map(tz => (
                  <ClockCard
                    key={tz.iana}
                    timezone={tz}
                    referenceTime={referenceTime}
                    onRemove={handleTimezoneRemove}
                    isLocal={tz.iana === localTimezoneIana}
                    weather={weatherData[tz.iana]}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-6 bg-slate-800/80 rounded-lg border border-slate-700">
                  <h2 className="text-2xl font-semibold text-white mb-2">What's the vibe?</h2>
                  <p className="text-slate-400 mb-6">Add a city to sync up your squad's timezones.</p>
                  <TimezoneSelector onTimezoneAdd={handleTimezoneAdd} existingTimezones={selectedTimezones} isButton={true} />
              </div>
            )}
          </main>
          
          {selectedTimezones.length > 0 && (
            <footer className="mt-12">
              <TimeSlider
                referenceTime={referenceTime}
                onTimeChange={handleSliderChange}
                onReset={resetToNow}
                isPlanning={isPlanning}
              />
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;