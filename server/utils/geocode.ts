export const geocode = async (location: string): Promise<{ latitude: number | null, longitude: number | null }> => {
  try {
    const res = await $fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json`)
    if (res?.length) {
      return {
        latitude: parseFloat(res[0].lat),
        longitude: parseFloat(res[0].lon)
      }
    }
  } catch (e) {
    console.error("Geocoding failed:", e)
  }
  return { latitude: null, longitude: null }
}