export const formatZone = (zoneName: string) => {
  return `${zoneName.split("/")[1].replaceAll("_", " ")}, ${
    zoneName.split("/")[0]
  }`
}

export const formatTime = (offset: number, isHour12: boolean): string => {
  return `${new Date(Date.now() + offset * 1000).toLocaleTimeString("en", {
    timeStyle: "short",
    hour12: isHour12,
    timeZone: "UTC",
  })}`
}
