export type WeatherData = {
    temperature: number
    humidity: number
    windSpeed: number
    pressure: number
  }
  
  export type PredictionResponse = {
    prediction: string
    confidence: number
  }
  
  export type District = {
    name: string
    lat: number
    lng: number
  }