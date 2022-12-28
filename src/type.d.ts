export interface Timezone {
  zone_name: string
  country_code: string
  abbreviation: string
  time_start: number
  gmt_offset: number
  dst: number
}

export interface SavedTimezone extends Timezone {
  id: string
  saved_at: number
}
