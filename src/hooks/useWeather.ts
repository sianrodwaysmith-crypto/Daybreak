import { useState, useEffect } from 'react'
import { useDayBreakContext } from '../contexts/DayBreakContext'

export interface WeatherData {
  temp: number
  high: number
  low: number
  rainChance: number
  condition: string
  emoji: string
  fetchedAt: number
}

const CACHE_KEY = 'daybreak-weather'
const TTL = 30 * 60 * 1000

function wmoMap(code: number): { condition: string; emoji: string } {
  if (code === 0)                 return { condition: 'Clear Sky',     emoji: '☀️' }
  if (code >= 1  && code <= 3)    return { condition: 'Partly Cloudy', emoji: '⛅' }
  if (code === 45 || code === 48) return { condition: 'Foggy',         emoji: '🌫️' }
  if (code >= 51 && code <= 67)   return { condition: 'Rainy',         emoji: '🌧️' }
  if (code >= 71 && code <= 77)   return { condition: 'Snowy',         emoji: '🌨️' }
  if (code >= 80 && code <= 82)   return { condition: 'Showery',       emoji: '🌦️' }
  if (code >= 95 && code <= 99)   return { condition: 'Stormy',        emoji: '⛈️' }
  return { condition: 'Clear Sky', emoji: '☀️' }
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,precipitation_probability` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&timezone=auto&forecast_days=1`

  const res = await fetch(url)
  if (!res.ok) throw new Error('weather fetch failed')
  const json = await res.json()

  const { condition, emoji } = wmoMap(json.current.weather_code)
  return {
    temp:       Math.round(json.current.temperature_2m),
    high:       Math.round(json.daily.temperature_2m_max[0]),
    low:        Math.round(json.daily.temperature_2m_min[0]),
    rainChance: json.current.precipitation_probability ?? 0,
    condition,
    emoji,
    fetchedAt:  Date.now(),
  }
}

function loadCache(): WeatherData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as WeatherData
  } catch {
    return null
  }
}

export function useWeather(): WeatherData | null {
  const { registerContent } = useDayBreakContext()
  const [weather, setWeather] = useState<WeatherData | null>(() => {
    const cached = loadCache()
    return cached && Date.now() - cached.fetchedAt < TTL ? cached : null
  })

  useEffect(() => {
    if (weather) {
      registerContent('weather', {
        condition:  weather.condition,
        temp:       weather.temp,
        high:       weather.high,
        low:        weather.low,
        rainChance: weather.rainChance,
      })
    }
  }, [weather, registerContent])

  useEffect(() => {
    const cached = loadCache()

    // Valid cache — nothing to do
    if (cached && Date.now() - cached.fetchedAt < TTL) return

    if (!navigator?.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const data = await fetchWeather(latitude, longitude)
          localStorage.setItem(CACHE_KEY, JSON.stringify(data))
          setWeather(data)
        } catch {
          // API error — silently keep whatever state we have
        }
      },
      () => {
        // Permission denied — hide banner silently (weather stays null)
      },
      { timeout: 10000, maximumAge: 60000 },
    )
  }, [])

  return weather
}
