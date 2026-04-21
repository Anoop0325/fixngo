
import { useState, useCallback } from 'react'

export function useGeolocation() {
  const [location, setLocation]   = useState(null)   
  const [error,    setError]      = useState(null)
  const [loading,  setLoading]    = useState(false)

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location permission denied. Please enter your location manually.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Please try again.')
            break
          case err.TIMEOUT:
            setError('Location request timed out. Please try again.')
            break
          default:
            setError('An unknown error occurred while retrieving location.')
        }
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }, [])

  const setManualLocation = useCallback((lat, lng) => {
    setLocation({ lat: parseFloat(lat), lng: parseFloat(lng) })
    setError(null)
  }, [])

  return { location, error, loading, getLocation, setManualLocation }
}
