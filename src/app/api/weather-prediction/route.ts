import { NextResponse } from 'next/server'
import type { WeatherData } from '@/components/weather/types'

interface WeatherRules {
  temperature: number
  humidity: number
  pressure: number
  windSpeed: number
}

function calculateWeatherScore(data: WeatherRules): {prediction: string, confidence: number} {
  let scores = {
    Sunny: 0,
    Rainy: 0,
    Cloudy: 0,
    'Partly Cloudy': 0
  }
  
  // Reglas para día soleado
  if (data.temperature > 25) scores.Sunny += 0.3
  if (data.humidity < 60) scores.Sunny += 0.2
  if (data.pressure > 1015) scores.Sunny += 0.2
  if (data.windSpeed < 15) scores.Sunny += 0.3
  
  // Reglas para lluvia
  if (data.humidity > 70) scores.Rainy += 0.3
  if (data.pressure < 1010) scores.Rainy += 0.3
  if (data.temperature < 20) scores.Rainy += 0.2
  if (data.windSpeed > 20) scores.Rainy += 0.2
  
  // Reglas para nublado
  if (data.humidity > 60 && data.humidity < 80) scores.Cloudy += 0.3
  if (data.pressure < 1015 && data.pressure > 1005) scores.Cloudy += 0.3
  if (data.temperature > 15 && data.temperature < 25) scores.Cloudy += 0.2
  if (data.windSpeed > 10 && data.windSpeed < 25) scores.Cloudy += 0.2
  
  // Reglas para parcialmente nublado
  if (data.humidity > 50 && data.humidity < 70) scores['Partly Cloudy'] += 0.3
  if (data.pressure > 1010 && data.pressure < 1020) scores['Partly Cloudy'] += 0.3
  if (data.temperature > 20 && data.temperature < 30) scores['Partly Cloudy'] += 0.2
  if (data.windSpeed > 5 && data.windSpeed < 20) scores['Partly Cloudy'] += 0.2

  // Encontrar la predicción con mayor puntuación
  let maxScore = 0
  let prediction = 'Sunny'
  
  for (const [weather, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      prediction = weather
    }
  }

  // Calcular la confianza basada en qué tan definitiva fue la predicción
  const confidence = Math.min(maxScore, 1)

  return {
    prediction,
    confidence
  }
}

export async function POST(request: Request) {
  try {
    const data: WeatherData = await request.json()
    
    // Verificar que tenemos todos los datos necesarios
    if (!data.temperature || !data.humidity || !data.pressure || !data.windSpeed) {
      return NextResponse.json(
        { error: 'Missing required weather parameters' },
        { status: 400 }
      )
    }

    const result = calculateWeatherScore({
      temperature: data.temperature,
      humidity: data.humidity,
      pressure: data.pressure,
      windSpeed: data.windSpeed
    })

    return NextResponse.json({
      prediction: result.prediction,
      confidence: result.confidence,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process weather prediction' },
      { status: 500 }
    )
  }
}