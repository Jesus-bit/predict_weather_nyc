'use client'

import Map, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { District } from './types'

interface WeatherMapProps {
  selectedDistrict: District
}

export default function WeatherMap({ selectedDistrict }: WeatherMapProps) {
  return (
    <div className="w-full h-full">
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
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