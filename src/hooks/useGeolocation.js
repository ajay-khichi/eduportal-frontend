import { useState, useEffect, useCallback } from 'react';

export function useGeolocation(options = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }) {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
    error: null,
    loading: false,
  });

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          error: null,
          loading: false,
        });
      },
      (error) => {
        let msg = 'Unable to retrieve your location';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please allow GPS access to verify attendance.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        setLocation((prev) => ({
          ...prev,
          error: msg,
          loading: false,
        }));
      },
      options
    );
  }, [options]);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return { ...location, refreshLocation: getLocation };
}
