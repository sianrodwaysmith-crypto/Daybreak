import { type WeatherData } from '../hooks/useWeather'

interface Props {
  weather: WeatherData
}

export default function WeatherBanner({ weather }: Props) {
  return (
    <div className="weather-banner">
      <span className="weather-emoji">{weather.emoji}</span>
      <span className="weather-temp">{weather.temp}°</span>
      <span className="weather-sep">·</span>
      <span className="weather-cond">{weather.condition}</span>
      <span className="weather-sep">·</span>
      <span className="weather-range">High {weather.high}°&nbsp;&nbsp;Low {weather.low}°</span>
      <span className="weather-sep">·</span>
      <span className="weather-rain">{weather.rainChance}% rain</span>
    </div>
  )
}
