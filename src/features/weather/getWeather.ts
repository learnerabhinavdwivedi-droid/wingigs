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

/**
 * Fetches real weather and air quality conditions from Open-Meteo (free, zero-API-key open service).
 * Falls back safely to seasonal baseline if network is unavailable or offline.
 */
export async function getRealWeather(cityName?: string): Promise<WeatherData> {
  const cleanCity = (cityName || 'Seattle').toLowerCase().trim();
  const cacheKey = `${CACHE_KEY_PREFIX}${cleanCity}`;

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
    } catch {}
  }

  // Resolve coordinates
  let coords = KNOWN_COORDINATES[cleanCity];
  if (!coords) {
    coords = KNOWN_COORDINATES['seattle'];
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

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

    if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
      const wData = await weatherRes.value.json();
      if (wData.current) {
        temperature = Math.round(wData.current.temperature_2m ?? 20);
        precipitation = Math.round(wData.current.precipitation ?? 0);
      }
    }

    if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
      const aData = await aqiRes.value.json();
      if (aData.current && typeof aData.current.us_aqi === 'number') {
        aqi = Math.round(aData.current.us_aqi);
      }
    }

    const weatherData: WeatherData = {
      temperature,
      precipitation,
      aqi,
      visibility: 10
    };

    // Cache result locally
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: weatherData
        }));
      } catch {}
    }

    return weatherData;

  } catch {
    // Return resilient fallback if offline or request blocked
    return {
      temperature: 19,
      precipitation: 0,
      aqi: 38,
      visibility: 10
    };
  }
}
