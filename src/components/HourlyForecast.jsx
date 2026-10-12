import React, { useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { getWeatherEmoji, formatHour } from '../utils/weatherCodes.js';

export default function HourlyForecast({ weather }) {
  const scrollRef = useRef(null);
  const hourly = weather.hourly;
  const now = new Date();

  // Find the current hour index
  const startIdx = hourly.time.findIndex((t) => new Date(t) >= now);
  const slice = hourly.time.slice(startIdx, startIdx + 24);
  const temps = hourly.temperature_2m.slice(startIdx, startIdx + 24);
  const precip = hourly.precipitation_probability.slice(startIdx, startIdx + 24);
  const codes = hourly.weather_code.slice(startIdx, startIdx + 24);
  const winds = hourly.wind_speed_10m.slice(startIdx, startIdx + 24);

  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const range = maxT - minT || 1;

  return (
    <div className="animate-fade-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
      <h2 className="font-display font-semibold text-white/70 text-xs uppercase tracking-widest mb-3">
        24-Hour Forecast
      </h2>
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slice.map((time, i) => {
          const barH = Math.round(((temps[i] - minT) / range) * 40 + 10);
          const isNow = i === 0;
          return (
            <div
              key={time}
              className={`flex flex-col items-center gap-2 min-w-[64px] rounded-2xl py-3 px-2 transition-all duration-300 ${
                isNow
                  ? 'bg-atmo-blue/20 border border-atmo-blue/40'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              <span className={`text-xs font-display font-semibold ${isNow ? 'text-atmo-blue' : 'text-white/50'}`}>
                {isNow ? 'Now' : formatHour(time)}
              </span>
              <span className="text-xl leading-none">{getWeatherEmoji(codes[i])}</span>
              <div className="flex flex-col items-center justify-end" style={{ height: 50 }}>
                <div
                  className="w-1.5 rounded-full bg-gradient-to-t from-atmo-blue to-atmo-teal opacity-70"
                  style={{ height: barH }}
                />
              </div>
              <span className="text-white font-display font-bold text-sm">{Math.round(temps[i])}°</span>
              {precip[i] > 0 && (
                <span className="text-atmo-blue text-xs">{precip[i]}%</span>
              )}
              {precip[i] === 0 && (
                <span className="text-white/20 text-xs">—</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
