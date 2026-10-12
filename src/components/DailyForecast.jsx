import React from 'react';
import { Droplets, Wind } from 'lucide-react';
import { getWeatherDescription, getWeatherEmoji, formatDay } from '../utils/weatherCodes.js';

export default function DailyForecast({ weather }) {
  const daily = weather.daily;
  const days = daily.time;

  const globalMin = Math.min(...daily.temperature_2m_min);
  const globalMax = Math.max(...daily.temperature_2m_max);
  const range = globalMax - globalMin || 1;

  return (
    <div className="animate-fade-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
      <h2 className="font-display font-semibold text-white/70 text-xs uppercase tracking-widest mb-3">
        7-Day Forecast
      </h2>
      <div className="space-y-2">
        {days.map((day, i) => {
          const tMin = daily.temperature_2m_min[i];
          const tMax = daily.temperature_2m_max[i];
          const barLeft = ((tMin - globalMin) / range) * 100;
          const barWidth = ((tMax - tMin) / range) * 100;
          const isToday = i === 0;

          return (
            <div
              key={day}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
                isToday
                  ? 'bg-white/10 border border-white/20'
                  : 'bg-white/5 border border-white/8 hover:bg-white/8'
              }`}
            >
              {/* Day label */}
              <div className="w-20 shrink-0">
                <p className={`font-display font-semibold text-sm ${isToday ? 'text-atmo-blue' : 'text-white'}`}>
                  {isToday ? 'Today' : formatDay(day).split(',')[0]}
                </p>
                <p className="text-white/40 text-xs">{formatDay(day).split(',').slice(1).join(',').trim()}</p>
              </div>

              {/* Emoji */}
              <span className="text-2xl leading-none shrink-0">{getWeatherEmoji(daily.weather_code[i])}</span>

              {/* Condition */}
              <div className="flex-1 hidden sm:block">
                <p className="text-white/60 text-xs truncate">{getWeatherDescription(daily.weather_code[i])}</p>
              </div>

              {/* Precip */}
              <div className="flex items-center gap-1 text-white/40 text-xs w-12 justify-center shrink-0">
                {daily.precipitation_sum[i] > 0 && (
                  <>
                    <Droplets className="w-3 h-3 text-atmo-blue" />
                    <span className="text-atmo-blue">{daily.precipitation_sum[i].toFixed(1)}</span>
                  </>
                )}
              </div>

              {/* Temp bar */}
              <div className="flex items-center gap-2 w-36 sm:w-44 shrink-0">
                <span className="text-white/50 text-xs w-7 text-right font-display">{Math.round(tMin)}°</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full relative">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-atmo-blue to-atmo-amber"
                    style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                  />
                </div>
                <span className="text-white text-xs w-7 font-display font-semibold">{Math.round(tMax)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
