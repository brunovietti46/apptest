import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatHour } from '../utils/weatherCodes.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-sky-900/90 border border-white/20 rounded-xl px-3 py-2 text-sm backdrop-blur-md">
        <p className="text-white/50 text-xs mb-1">{label}</p>
        <p className="text-atmo-blue font-display font-bold">{Math.round(payload[0].value)}°C</p>
        {payload[1] && (
          <p className="text-atmo-teal text-xs">Precip: {payload[1].value}%</p>
        )}
      </div>
    );
  }
  return null;
};

export default function TemperatureChart({ weather }) {
  const hourly = weather.hourly;
  const now = new Date();
  const startIdx = hourly.time.findIndex((t) => new Date(t) >= now);

  const data = hourly.time.slice(startIdx, startIdx + 24).map((t, i) => ({
    time: formatHour(t),
    temp: hourly.temperature_2m[startIdx + i],
    precip: hourly.precipitation_probability[startIdx + i],
  }));

  return (
    <div className="animate-fade-up" style={{ animationDelay: '0.35s', opacity: 0 }}>
      <h2 className="font-display font-semibold text-white/70 text-xs uppercase tracking-widest mb-4">
        Temperature Trend
      </h2>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#38BDF8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="precipGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Syne' }}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              yAxisId="temp"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'Syne' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}°`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              yAxisId="temp"
              type="monotone"
              dataKey="temp"
              stroke="#38BDF8"
              strokeWidth={2}
              fill="url(#tempGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#38BDF8', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
