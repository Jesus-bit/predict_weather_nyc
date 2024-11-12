'use client'

import { useState } from 'react'
import WeatherMap from '@/components/weather/WeatherMap'
import WeatherCard from '@/components/weather/WeatherCard'
import { nycDistricts } from '@/lib/constants/districts'
import type { District } from '@/components/weather/types'

export default function WeatherPage() {
  const [selectedDistrict, setSelectedDistrict] = useState<District>(nycDistricts[0])

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/2 p-4 overflow-y-auto">
        <WeatherCard onDistrictChange={setSelectedDistrict} />
      </div>
      <div className="w-full md:w-1/2 h-full">
        <WeatherMap selectedDistrict={selectedDistrict} />
      </div>
    </div>
  )
}