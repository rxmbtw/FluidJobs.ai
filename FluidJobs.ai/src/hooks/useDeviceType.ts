import { useState, useEffect } from 'react'

export type DeviceType = 'mobile' | 'desktop'

const MOBILE_BREAKPOINT = 768

export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>(
    window.innerWidth < MOBILE_BREAKPOINT ? 'mobile' : 'desktop'
  )

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(window.innerWidth < MOBILE_BREAKPOINT ? 'mobile' : 'desktop')
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return deviceType
}
