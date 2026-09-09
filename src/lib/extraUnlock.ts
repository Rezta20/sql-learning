let extraVisible = false

export function isExtraVisible(): boolean {
  return extraVisible
}

export function showExtra(): void {
  extraVisible = true
}

export function hideExtra(): void {
  extraVisible = false
}
