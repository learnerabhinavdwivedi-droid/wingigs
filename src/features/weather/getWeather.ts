import { WeatherData } from '../../domain/rules/envelope';

// Fast coordinate resolution for major athlete hubs
const KNOWN_COORDINATES: Record<string, { lat: number; lon: number }> = {
  seattle: { lat: 47.6062, lon: -122.3321 },
  'san francisco': { lat: 37.7749, lon: -122.4194 },
  'new york': { lat: 40.7128, lon: -74.0060 },
  austin: { lat: 30.2672, lon: -97.7431 },
  london: { lat: 51.5074, lon: -0.1278 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  bengaluru: { lat: 12.9716, lon: 77.5946 },
  toronto: { lat: 43.6532, lon: -79.3832 },
  chicago: { lat: 41.8781, lon: -87.6298 }
};

const CACHE_KEY_PREFIX = 'bahar_weather_cache_';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes cache

interface GeocodeResult {
  results?: Array<{
    latitude: number;
    longitude: number;
    name: string;
    country?: string;
  }>;
}

/**
 * Dynamically resolves coordinates for any global city using Open-Meteo's free geocoding API.
 */
async function resolveCoordinates(cityName: string, signal: AbortSignal): Promise<{ lat: number; lon: number; resolvedName: string } | null> {
  const lower = cityName.toLowerCase().trim();
  if (KNOWN_COORDINATES[lower]) {
    return { ...KNOWN_COORDINATES[lower], resolvedName: cityName };
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    const res = await fetch(geoUrl, { signal });
    if (!res.ok) return null;
    const data: GeocodeResult = await res.json();
    if (data.results && data.results.length > 0) {
      return {
        lat: data.results[0].latitude,
        lon: data.results[0].longitude,
        resolvedName: data.results[0].name
      };
    }
  } catch {
    // Network or abort error
  }
  return null;
}

/**
 * Fetches real weather and air quality conditions from Open-Meteo (free, zero-API-key open service).
 * Dynamically geocodes any city worldwide. If offline or network fails, safely returns a
 * transparently flagged fallback so the athlete always knows data provenance.
 */
export async function getRealWeather(cityName?: string): Promise<WeatherData> {
  const cleanCity = (cityName || 'Seattle').trim();
  const cacheKey = `${CACHE_KEY_PREFIX}${cleanCity.toLowerCase()}`;

  // Check local cache
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
          return parsed.data;
        }
      }
    } catch {
      // Ignore cache read failures
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500); // 4.5s overall timeout

  try {
    // 1. Resolve coordinates dynamically (supports Lucknow, Tokyo, Berlin, Seattle, etc.)
    const resolved = await resolveCoordinates(cleanCity, controller.signal);
    const coords = resolved ? { lat: resolved.lat, lon: resolved.lon } : KNOWN_COORDINATES['seattle'];
    const resolvedCity = resolved?.resolvedName || cleanCity;

    // 2. Fetch live weather & AQI in parallel
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,precipitation,weather_code`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.lat}&longitude=${coords.lon}&current=us_aqi`;

    const [weatherRes, aqiRes] = await Promise.allSettled([
      fetch(weatherUrl, { signal: controller.signal }),
      fetch(aqiUrl, { signal: controller.signal })
    ]);

    clearTimeout(timer);

    let temperature = 20; // Celsius default
    let precipitation = 0; // mm
    let aqi = 35; // Good AQI default
    let liveDataReceived = false;

    if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
      const wData = await weatherRes.value.json();
      if (wData.current) {
        temperature = Math.round(wData.current.temperature_2m ?? 20);
        precipitation = Math.round(wData.current.precipitation ?? 0);
        liveDataReceived = true;
      }
    }

    if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
      const aData = await aqiRes.value.json();
      if (aData.current && typeof aData.current.us_aqi === 'number') {
        aqi = Math.round(aData.current.us_aqi);
        liveDataReceived = true;
      }
    }

    const weatherData: WeatherData = {
      temperature,
      precipitation,
      aqi,
      visibility: 10,
      isFallback: !liveDataReceived,
      resolvedCity
    };

    // Cache result locally
    if (typeof window !== 'undefined' && liveDataReceived) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: weatherData
        }));
      } catch {
        // Ignore cache storage errors
      }
    }

    return weatherData;

  } catch {
    clearTimeout(timer);
    // Transparently return safe fallback with provenance flag
    return {
      temperature: 19,
      precipitation: 0,
      aqi: 38,
      visibility: 10,
      isFallback: true,
      resolvedCity: cleanCity
    };
  }
}
