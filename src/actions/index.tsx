import {
  Action,
  Icon,
  ActionPanel,
  openExtensionPreferences,
} from "@raycast/api"

export const CopyActions = ({ time, abbr }: { time: string; abbr: string }) => (
  <ActionPanel.Section title="Copy">
    <Action.CopyToClipboard
      icon={Icon.CopyClipboard}
      title="Copy Time"
      shortcut={{ modifiers: ["cmd"], key: "c" }}
      content={time!}
    />
    <Action.CopyToClipboard
      icon={Icon.CopyClipboard}
      title="Copy Abbreviation"
      shortcut={{ modifiers: ["cmd", "ctrl"], key: "c" }}
      content={abbr}
    />
    <Action.CopyToClipboard
      icon={Icon.CopyClipboard}
      title="Copy Time and Abbreviation"
      shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
      content={`${time} ${abbr}`}
    />
  </ActionPanel.Section>
)

export const PreferencesAction = () => (
  <ActionPanel.Section title="Preferences">
    <Action
      icon={Icon.Gear}
      title="Open Extension Preferences"
      onAction={openExtensionPreferences}
    />
  </ActionPanel.Section>
)
