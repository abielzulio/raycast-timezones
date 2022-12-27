import { environment } from "@raycast/api"
import { useSQL } from "@raycast/utils"
import path from "path"

interface Timezone {
  zone_name: string
  country_code: string
  abbreviation: string
  time_start: number
  gmt_offset: number
  dst: number
}

export const useTimezoneSearch = (query?: string) => {
  const defaultQuery = `SELECT * FROM 'time_zone' LIMIT 0,100`
  return useSQL<Timezone>(
    path.join(environment.assetsPath, "data.sqllite"),
    !query
      ? defaultQuery
      : `SELECT * FROM 'time_zone' 
        WHERE zone_name LIKE '%${query}%'
          OR country_code '%${query}%'
          OR abbreviation '%${query}%'
        `
  )
}
