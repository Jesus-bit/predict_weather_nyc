'use client'

import { useEffect, useState } from 'react'
import Map, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { District } from './types'

interface WeatherMapProps {
  selectedDistrict: District
}

export default function WeatherMap({ selectedDistrict }: WeatherMapProps) {
  const [mapboxToken, setMapboxToken] = useState<string>('')

  useEffect(() => {
    const getMapboxToken = async () => {
      try {
        const response = await fetch('/api/mapbox')
        const data = await response.json()
        setMapboxToken(data.token)
      } catch (error) {
        console.error('Error fetching Mapbox token:', error)
      }
    }

    getMapboxToken()
  }, [])

  if (!mapboxToken) {
    return <div>Loading map...</div>
  }

  return (
    <div className="w-full h-full">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: selectedDistrict.lng,
          latitude: selectedDistrict.lat,
          zoom: 10
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        reuseMaps
      >
        <Marker
          longitude={selectedDistrict.lng}
          latitude={selectedDistrict.lat}
          color="red"
        />
      </Map>
    </div>
  )
}