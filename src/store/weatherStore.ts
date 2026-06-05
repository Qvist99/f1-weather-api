import type { WeatherData } from "../types/weather.js";


let latestWeather: WeatherData | null = null;

export function setWeather(data: WeatherData) {
    latestWeather = data;
}

export function getWeather(): WeatherData | null {
    return latestWeather;
}

// For testing purposes, we can reset the weather data
export function resetWeather(): void {
    latestWeather = null;
}



