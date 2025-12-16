export interface LocationRecord {
  id?: number | string // Optional because draft locations don't have IDs yet
  lat: number
  lng: number
  address: string
  date?: string
}

export interface MapClickEvent {
  latlng: {
    lat: number
    lng: number
  }
}
