'use client'

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Thermometer, Droplet, Wind, Loader2 } from "lucide-react"
import { nycDistricts } from "@/lib/constants/districts"
import type { WeatherData, PredictionResponse, District } from './types'

// Asegúrate de crear un archivo .env.local con tu API key
const OPENWEATHER_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

interface WeatherCardProps {
  onDistrictChange: (district: District) => void
}

export default function WeatherCard({ onDistrictChange }: WeatherCardProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDistrict, setSelectedDistrict] = useState<District>(nycDistricts[0])
  const [error, setError] = useState<string | null>(null)

  const fetchWeatherData = async (district: District) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${district.lat}&lon=${district.lng}&appid=${OPENWEATHER_API_KEY}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch weather data')
      }

      const data = await response.json()

      // Transformar los datos al formato esperado
      const formattedData: WeatherData = {
        temperature: Math.round(data.main.temp), // Ya está en Fahrenheit por units=imperial
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        pressure: data.main.pressure // Añadimos presión que necesitamos para las predicciones
      }

      return formattedData
    } catch (error) {
      console.error('Error fetching weather data:', error)
      throw error
    }
  }

  const handleDistrictChange = async (districtName: string) => {
    const district = nycDistricts.find(d => d.name === districtName) || nycDistricts[0]
    setSelectedDistrict(district)
    onDistrictChange(district)
    setError(null)
    await handlePredictWeather(district)
  }

  const handlePredictWeather = async (district: District = selectedDistrict) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await fetchWeatherData(district)
      setWeatherData(data)

      const predictionResponse = await fetch('/api/weather-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!predictionResponse.ok) throw new Error('Failed to fetch prediction')

      const predictionData: PredictionResponse = await predictionResponse.json()
      setPrediction(predictionData)
    } catch (error) {
      console.error('Error in weather prediction:', error)
      setError('Failed to fetch weather data. Please try again later.')
      setPrediction(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    handlePredictWeather()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>NYC Weather Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="district-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select a district
            </label>
            <Select onValueChange={handleDistrictChange} value={selectedDistrict.name}>
              <SelectTrigger id="district-select">
                <SelectValue placeholder="Select a district" />
              </SelectTrigger>
              <SelectContent>
                {nycDistricts.map((district) => (
                  <SelectItem key={district.name} value={district.name}>
                    {district.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={() => handlePredictWeather()} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh Weather Data'
            )}
          </Button>

          {error && (
            <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          {weatherData && (
            <div className="mt-4 grid gap-4">
              <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                <Thermometer className="text-red-500 h-5 w-5" />
                <span className="font-medium">{weatherData.temperature}°F</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                <Droplet className="text-blue-500 h-5 w-5" />
                <span className="font-medium">{weatherData.humidity}% Humidity</span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm">
                <Wind className="text-gray-500 h-5 w-5" />
                <span className="font-medium">{weatherData.windSpeed} mph Wind</span>
              </div>
            </div>
          )}

          {prediction && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <h3 className="font-semibold mb-2">Weather Prediction</h3>
              <p className="text-lg font-medium">{prediction.prediction}</p>
              <p className="text-sm text-gray-600 mt-1">
                Confidence: {(prediction.confidence * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}