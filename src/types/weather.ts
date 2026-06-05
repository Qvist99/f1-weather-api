export interface WeatherData {
    airTemp: number;
    trackTemp: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    rainfall: boolean;
    timestamp: string;
}


export interface RawWeatherData {
    AirTemp: string;
    Humidity: string;
    Pressure: string;
    Rainfall: string;
    TrackTemp: string;
    WindDirection: string;
    WindSpeed: string;
    _kf: boolean;
}