import { List } from "@raycast/api"
import { useState } from "react"
import { useTimezoneSearch } from "../hooks/useTimezoneSearch"

export default function Command() {
  const [searchText, setSearchText] = useState<string>()
  const { data, isLoading, permissionView } = useTimezoneSearch(searchText)

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
      searchText={searchText}
      onSearchTextChange={setSearchText}
      throttle={true}
    >
      {data?.map((item, id) => (
        <List.Item
          key={id}
          title={formatting(item.zone_name)}
          subtitle={item.abbreviation}
        />
      ))}
    </List>
  )
}
