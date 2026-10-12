import { useState, useCallback } from 'react';

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

export default function useWeather() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async (lat, lon, name, country) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'weather_code',
          'wind_speed_10m',
          'wind_direction_10m',
          'surface_pressure',
          'precipitation',
          'uv_index',
          'cloud_cover',
          'visibility',
        ].join(','),
        hourly: [
          'temperature_2m',
          'precipitation_probability',
          'weather_code',
          'wind_speed_10m',
        ].join(','),
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'precipitation_sum',
          'wind_speed_10m_max',
          'uv_index_max',
          'sunrise',
          'sunset',
        ].join(','),
        timezone: 'auto',
        forecast_days: 7,
      });

      const res = await fetch(`${WEATHER_URL}?${params}`);
      if (!res.ok) throw new Error('Failed to fetch weather data');
      const data = await res.json();

      setWeather(data);
      setLocation({ name, country, lat, lon });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchCity = useCallback(async (query) => {
    if (!query.trim()) return [];
    const res = await fetch(
      `${GEO_URL}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`
    );
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    return data.results || [];
  }, []);

  const fetchByCoords = useCallback(
    async (lat, lon) => {
      // Reverse geocode via Open-Meteo geocoding isn't supported, so use a label
      await fetchWeather(lat, lon, 'Your Location', '');
    },
    [fetchWeather]
  );

  return { weather, location, loading, error, fetchWeather, searchCity, fetchByCoords };
}
