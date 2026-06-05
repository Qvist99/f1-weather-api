import type { WeatherData, RawWeatherData } from '../types/weather.js';

export function mapWeatherData(data: RawWeatherData): WeatherData {
    return {
        airTemp: parseFloat(data.AirTemp),
        trackTemp: parseFloat(data.TrackTemp),
        humidity: parseFloat(data.Humidity),
        pressure: parseFloat(data.Pressure),
        windSpeed: parseFloat(data.WindSpeed),
        windDirection: parseInt(data.WindDirection),
        rainfall: data.Rainfall !== '0',
        timestamp: new Date().toISOString()
    };
}