import {
  Action,
  ActionPanel,
  Alert,
  confirmAlert,
  environment,
  getPreferenceValues,
  Icon,
  List,
  LocalStorage,
  showToast,
  Toast,
} from "@raycast/api"
import { useSQL } from "@raycast/utils"
import { randomUUID } from "crypto"
import path from "path"
import { useCallback, useEffect, useState } from "react"
import { CopyActions, PreferencesAction } from "./actions"
import type { SavedTimezone, Timezone } from "./type"
import { formatTime, formatZone } from "./utils"

export default function Command() {
  const [searchText, setSearchText] = useState<string>()
  const [isLoading, setLoading] = useState<boolean>(true)
  const [savedTimezones, setSavedTimezones] = useState<SavedTimezone[]>([])

  const [isHour12] = useState(() => {
    return getPreferenceValues<{ isHour12: boolean }>().isHour12
  })

  const {
    data,
    isLoading: isSQLLoading,
    permissionView,
  } = useSQL<Timezone>(
    path.join(environment.assetsPath, "data.sqlite"),
    !searchText
      ? `SELECT * FROM 'time_zone' LIMIT 0,100`
      : `SELECT * FROM 'time_zone' 
        WHERE zone_name LIKE '%${searchText.replaceAll(" ", "_")}%'
          OR country_code LIKE '%${searchText}%'
          OR abbreviation LIKE '%${searchText}%'
        LIMIT 0,10000`
  )

  useEffect(() => {
    ;(async () => {
      const storedSavedTimezone = await LocalStorage.getItem<string>(
        "savedTimezones"
      )

      if (!storedSavedTimezone) {
        setSavedTimezones([])
      } else {
        const timezone: SavedTimezone[] = JSON.parse(storedSavedTimezone)
        setLoading(false)
        setSavedTimezones((previous) => [...previous, ...timezone])
      }
    })()
  }, [])

  useEffect(() => {
    LocalStorage.setItem("savedTimezones", JSON.stringify(savedTimezones))
  }, [savedTimezones])

  const handleSaveTimezone = useCallback(
    async (timezone: Timezone) => {
      const toast = await showToast({
        title: "Saving timezone...",
        style: Toast.Style.Animated,
      })
      const newTimezone: SavedTimezone = {
        ...timezone,
        id: randomUUID(),
        saved_at: Date.now(),
      }
      setSavedTimezones([...savedTimezones, newTimezone])
      toast.title = "Timezone saved!"
      toast.style = Toast.Style.Success
    },
    [setSavedTimezones, savedTimezones]
  )

  const handleRemoveTimezone = useCallback(
    async (id: string | undefined) => {
      const toast = await showToast({
        title: "Removing timezone...",
        style: Toast.Style.Animated,
      })
      const newSavedTimezone = savedTimezones.filter(
        (savedTimezone) => savedTimezone.id !== id
      )
      setSavedTimezones(newSavedTimezone)
      toast.title = "Timezone removed!"
      toast.style = Toast.Style.Success
    },
    [setSavedTimezones, savedTimezones]
  )

  const itemAccessories = (time: string) => [
    {
      icon: Icon.Clock,
      text: time,
    },
  ]

  if (permissionView) {
    return permissionView
  }

  return (
    <List
      isLoading={isLoading ? isLoading : isSQLLoading}
      onSearchTextChange={setSearchText}
      throttle={true}
    >
      {savedTimezones && (
        <List.Section title="Saved Timezones">
          {savedTimezones
            ?.sort((a, b) => b.saved_at - a.saved_at)
            .map(({ id, zone_name, abbreviation, gmt_offset }) => {
              const time = formatTime(gmt_offset, isHour12)
              return (
                <List.Item
                  key={id}
                  title={formatZone(zone_name)}
                  subtitle={abbreviation}
                  accessories={itemAccessories(time)}
                  actions={
                    <ActionPanel>
                      <CopyActions time={time} abbr={abbreviation} />
                      <PreferencesAction />
                      <ActionPanel.Section title="Remove">
                        <Action
                          style={Action.Style.Destructive}
                          icon={Icon.Trash}
                          title="Remove Timezone"
                          shortcut={{ modifiers: ["cmd"], key: "delete" }}
                          onAction={async () => {
                            await confirmAlert({
                              title: "Remove Timezone",
                              message: "This action cannot be undone",
                              icon: Icon.Trash,
                              primaryAction: {
                                title: "Remove Timezone",
                                style: Alert.ActionStyle.Destructive,
                                onAction: () => handleRemoveTimezone(id),
                              },
                            })
                          }}
                        />
                      </ActionPanel.Section>
                    </ActionPanel>
                  }
                />
              )
            })}
        </List.Section>
      )}
      {searchText && (
        <List.Section title="All Timezones">
          {data
            ?.filter(
              (v, i, a) =>
                a.findIndex((v2) => v2.gmt_offset === v.gmt_offset) === i
            )
            .map((item, id) => {
              const time = formatTime(item.gmt_offset, isHour12)
              return (
                <List.Item
                  key={id}
                  title={formatZone(item.zone_name)}
                  subtitle={item.abbreviation}
                  accessories={itemAccessories(time)}
                  actions={
                    <ActionPanel>
                      <CopyActions time={time} abbr={item.abbreviation} />
                      <ActionPanel.Section title="Save">
                        <Action
                          title="Save Timezone"
                          shortcut={{ modifiers: ["cmd"], key: "s" }}
                          icon={Icon.Star}
                          onAction={() => handleSaveTimezone(item)}
                        />
                      </ActionPanel.Section>
                      <PreferencesAction />
                    </ActionPanel>
                  }
                />
              )
            })}
        </List.Section>
      )}
    </List>
  )
}
