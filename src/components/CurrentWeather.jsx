import React from 'react';
import { Droplets, Wind, Eye, Gauge, Thermometer, Cloud } from 'lucide-react';
import { getWeatherDescription, getWeatherEmoji, getWindDirection, getUVLabel } from '../utils/weatherCodes.js';

export default function CurrentWeather({ weather, location }) {
  const c = weather.current;
  const daily = weather.daily;
  const todayMax = daily.temperature_2m_max[0];
  const todayMin = daily.temperature_2m_min[0];
  const sunrise = daily.sunrise?.[0];
  const sunset = daily.sunset?.[0];
  const uvInfo = getUVLabel(c.uv_index);

  const formatTime = (iso) => {
    if (!iso) return '--';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
      {/* Main hero */}
      <div className="text-center mb-8">
        <p className="font-display text-white/60 text-sm uppercase tracking-widest mb-2">
          {location.name}{location.country ? `, ${location.country}` : ''}
        </p>
        <div className="text-8xl mb-3 leading-none">{getWeatherEmoji(c.weather_code)}</div>
        <div className="font-display text-white font-bold leading-none mb-2" style={{ fontSize: 'clamp(4rem, 10vw, 7rem)' }}>
          {Math.round(c.temperature_2m)}°
        </div>
        <p className="font-display text-atmo-blue text-xl font-semibold mb-1">
          {getWeatherDescription(c.weather_code)}
        </p>
        <p className="text-white/50 text-sm">
          Feels like {Math.round(c.apparent_temperature)}° &nbsp;·&nbsp; H:{Math.round(todayMax)}° L:{Math.round(todayMin)}°
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          icon={<Droplets className="w-5 h-5 text-atmo-blue" />}
          label="Humidity"
          value={`${c.relative_humidity_2m}%`}
          sub="Relative"
        />
        <StatCard
          icon={<Wind className="w-5 h-5 text-atmo-teal" />}
          label="Wind"
          value={`${Math.round(c.wind_speed_10m)} km/h`}
          sub={getWindDirection(c.wind_direction_10m)}
        />
        <StatCard
          icon={<Gauge className="w-5 h-5 text-atmo-violet" />}
          label="Pressure"
          value={`${Math.round(c.surface_pressure)} hPa`}
          sub="Surface"
        />
        <StatCard
          icon={<Eye className="w-5 h-5 text-atmo-amber" />}
          label="Visibility"
          value={c.visibility >= 1000 ? `${(c.visibility / 1000).toFixed(1)} km` : `${c.visibility} m`}
          sub="Clear sight"
        />
        <StatCard
          icon={<Thermometer className="w-5 h-5 text-atmo-rose" />}
          label="UV Index"
          value={Math.round(c.uv_index)}
          sub={<span className={uvInfo.color}>{uvInfo.label}</span>}
        />
        <StatCard
          icon={<Cloud className="w-5 h-5 text-white/60" />}
          label="Cloud Cover"
          value={`${c.cloud_cover}%`}
          sub={sunrise ? `☀️ ${formatTime(sunrise)} · 🌅 ${formatTime(sunset)}` : 'Sky coverage'}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-white/50 text-xs uppercase tracking-wider font-display">{label}</span>
      </div>
      <p className="font-display font-bold text-white text-2xl leading-tight">{value}</p>
      <p className="text-white/40 text-xs mt-1">{sub}</p>
    </div>
  );
}
