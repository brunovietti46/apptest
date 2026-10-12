import React, { useState } from 'react';
import { MapPin, AlertTriangle, Loader2, CloudSun } from 'lucide-react';
import useWeather from './hooks/useWeather.js';
import SearchBar from './components/SearchBar.jsx';
import CurrentWeather from './components/CurrentWeather.jsx';
import HourlyForecast from './components/HourlyForecast.jsx';
import DailyForecast from './components/DailyForecast.jsx';
import TemperatureChart from './components/TemperatureChart.jsx';

const POPULAR = [
  { name: 'New York', country: 'US', lat: 40.7128, lon: -74.006 },
  { name: 'London', country: 'GB', lat: 51.5074, lon: -0.1278 },
  { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney', country: 'AU', lat: -33.8688, lon: 151.2093 },
  { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
  { name: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
];

export default function App() {
  const { weather, location, loading, error, fetchWeather, searchCity, fetchByCoords } = useWeather();
  const [geoError, setGeoError] = useState(null);

  const handleSearch = (lat, lon, name, country) => {
    fetchWeather(lat, lon, name, country);
  };

  const handleGeolocate = () => {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      () => setGeoError('Unable to retrieve your location. Please search manually.')
    );
  };

  const bgClass = weather
    ? getBackgroundClass(weather.current.weather_code)
    : 'from-sky-950 via-sky-900 to-sky-800';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgClass} transition-all duration-1000 relative overflow-hidden`}>
      {/* Atmospheric background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-atmo-blue/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -right-24 w-80 h-80 bg-atmo-violet/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 bg-atmo-teal/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
        {/* Noise grain overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '128px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-atmo-blue" />
            <span className="font-display font-bold text-white text-xl tracking-tight">Clima</span>
          </div>
          <p className="text-white/30 text-xs font-display uppercase tracking-widest hidden sm:block">
            Weather & Climate
          </p>
        </header>

        {/* Search */}
        <div className="mb-8 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <SearchBar
            onSearch={handleSearch}
            onGeolocate={handleGeolocate}
            searchCity={searchCity}
          />
          {geoError && (
            <p className="text-atmo-rose text-xs mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> {geoError}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-atmo-blue animate-spin" />
            <p className="text-white/50 font-display text-sm">Fetching weather data...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertTriangle className="w-10 h-10 text-atmo-rose" />
            <p className="text-white font-display font-semibold">Something went wrong</p>
            <p className="text-white/50 text-sm">{error}</p>
          </div>
        )}

        {/* Weather data */}
        {weather && !loading && !error && (
          <div className="space-y-6">
            <CurrentWeather weather={weather} location={location} />
            <HourlyForecast weather={weather} />
            <TemperatureChart weather={weather} />
            <DailyForecast weather={weather} />
          </div>
        )}

        {/* Landing / Popular cities */}
        {!weather && !loading && !error && (
          <div className="animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <div className="text-center mb-10 py-8">
              <p className="font-display font-bold text-white/90 text-4xl sm:text-5xl leading-tight mb-3">
                Know your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-atmo-blue to-atmo-teal">
                  climate.
                </span>
              </p>
              <p className="text-white/40 text-sm max-w-xs mx-auto">
                Real-time weather forecasts, hourly breakdowns, and 7-day outlooks for anywhere on Earth.
              </p>
            </div>

            <div className="mb-3">
              <p className="text-white/40 text-xs font-display uppercase tracking-widest mb-3">
                Popular Destinations
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POPULAR.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => fetchWeather(city.lat, city.lon, city.name, city.country)}
                    className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 hover:border-atmo-blue/40 transition-all duration-300 text-left group"
                  >
                    <MapPin className="w-4 h-4 text-white/30 group-hover:text-atmo-blue transition-colors shrink-0" />
                    <div>
                      <p className="text-white text-sm font-display font-medium">{city.name}</p>
                      <p className="text-white/30 text-xs">{city.country}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 text-center text-white/20 text-xs font-display">
          Powered by Open-Meteo · Free & Open Weather Data
        </footer>
      </div>
    </div>
  );
}

function getBackgroundClass(code) {
  if (code === 0 || code === 1) return 'from-sky-900 via-blue-900 to-indigo-950';
  if (code === 2 || code === 3) return 'from-slate-900 via-sky-950 to-slate-800';
  if (code >= 45 && code <= 48) return 'from-gray-900 via-slate-800 to-gray-900';
  if (code >= 51 && code <= 67) return 'from-slate-950 via-blue-950 to-slate-900';
  if (code >= 71 && code <= 77) return 'from-slate-800 via-blue-900 to-slate-950';
  if (code >= 80 && code <= 82) return 'from-slate-950 via-sky-950 to-blue-950';
  if (code >= 95) return 'from-gray-950 via-slate-900 to-purple-950';
  return 'from-sky-950 via-sky-900 to-sky-800';
}
