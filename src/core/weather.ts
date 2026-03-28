export interface OpenMeteoWeatherDescriptor {
  color: number;
  emoji: string;
  label: string;
}

function descriptor(
  label: string,
  emoji: string,
  color: number,
): OpenMeteoWeatherDescriptor {
  return { color, emoji, label };
}

export function describeOpenMeteoWeather(
  code: number | undefined,
  isDay = true,
): OpenMeteoWeatherDescriptor {
  switch (code) {
    case 0:
      return isDay
        ? descriptor("Clear sky", "☀️", 0xf6c453)
        : descriptor("Clear sky", "🌙", 0x64748b);
    case 1:
      return isDay
        ? descriptor("Mainly clear", "🌤️", 0xf6c453)
        : descriptor("Mainly clear", "🌙", 0x64748b);
    case 2:
      return descriptor("Partly cloudy", "⛅", 0x60a5fa);
    case 3:
      return descriptor("Overcast", "☁️", 0x94a3b8);
    case 45:
    case 48:
      return descriptor("Fog", "🌫️", 0x94a3b8);
    case 51:
    case 53:
    case 55:
      return descriptor("Drizzle", "🌦️", 0x38bdf8);
    case 56:
    case 57:
      return descriptor("Freezing drizzle", "🧊", 0x7dd3fc);
    case 61:
    case 63:
    case 65:
      return descriptor("Rain", "🌧️", 0x2563eb);
    case 66:
    case 67:
      return descriptor("Freezing rain", "🥶", 0x0ea5e9);
    case 71:
    case 73:
    case 75:
    case 77:
      return descriptor("Snow", "❄️", 0xbae6fd);
    case 80:
    case 81:
    case 82:
      return descriptor("Rain showers", "🌦️", 0x2563eb);
    case 85:
    case 86:
      return descriptor("Snow showers", "🌨️", 0x93c5fd);
    case 95:
      return descriptor("Thunderstorm", "⛈️", 0xf97316);
    case 96:
    case 99:
      return descriptor("Thunderstorm with hail", "⛈️", 0xea580c);
    default:
      return descriptor("Weather update", "🌦️", 0x60a5fa);
  }
}

