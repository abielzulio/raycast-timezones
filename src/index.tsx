import { List } from "@raycast/api"
import { useState } from "react"
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

export default function Command() {
  const [searchText, setSearchText] = useState<string>()
  const { data, isLoading, permissionView } = useSQL<Timezone>(
    path.join(environment.assetsPath, "data.sqlite"),
    !searchText
      ? `SELECT * FROM 'time_zone' LIMIT 0,100`
      : `SELECT * FROM 'time_zone' 
        WHERE zone_name LIKE '%${searchText}%'
          OR country_code LIKE '%${searchText}%'
          OR abbreviation LIKE '%${searchText}%'
        `
  )

  const formatting = (zoneName: string) => {
    return `${zoneName.split("/")[1].replace("_", " ")}, ${
      zoneName.split("/")[0]
    }`
  }

  if (permissionView) {
    return permissionView
  }

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={setSearchText}
      throttle={true}
    >
      {data?.map((item, id) => (
        <List.Item
          key={id}
          title={formatting(item.zone_name)}
          subtitle={item.abbreviation}
          accessories={[
            {
              text: `${new Date(Date.now() + item.gmt_offset * 1000)
                .getUTCHours()
                .toLocaleString()}:${new Date(
                Date.now() + item.gmt_offset * 1000
              )
                .getUTCMinutes()
                .toLocaleString()}`,
            },
          ]}
        />
      ))}
    </List>
  )
}
