// WMO Weather Code interpretations
export const weatherDescriptions = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Icy Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  56: 'Freezing Drizzle',
  57: 'Heavy Freezing Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  66: 'Freezing Rain',
  67: 'Heavy Freezing Rain',
  71: 'Slight Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Slight Showers',
  81: 'Moderate Showers',
  82: 'Violent Showers',
  85: 'Slight Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm w/ Hail',
  99: 'Thunderstorm w/ Heavy Hail',
};

export const weatherEmoji = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌧️',
  56: '🌧️',
  57: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  66: '🌨️',
  67: '🌨️',
  71: '🌨️',
  73: '❄️',
  75: '❄️',
  77: '❄️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  85: '🌨️',
  86: '❄️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
};

export const getWeatherDescription = (code) =>
  weatherDescriptions[code] ?? 'Unknown';

export const getWeatherEmoji = (code) => weatherEmoji[code] ?? '🌡️';

export const getWindDirection = (degrees) => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
};

export const formatHour = (isoString) => {
  const date = new Date(isoString);
  const h = date.getHours();
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  return h < 12 ? `${h} AM` : `${h - 12} PM`;
};

export const formatDay = (dateString) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const getUVLabel = (uv) => {
  if (uv <= 2) return { label: 'Low', color: 'text-emerald-400' };
  if (uv <= 5) return { label: 'Moderate', color: 'text-atmo-amber' };
  if (uv <= 7) return { label: 'High', color: 'text-orange-400' };
  if (uv <= 10) return { label: 'Very High', color: 'text-atmo-rose' };
  return { label: 'Extreme', color: 'text-purple-400' };
};
