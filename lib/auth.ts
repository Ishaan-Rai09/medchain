export const APP_NAME = "MedChain"

export const PUBLIC_PORTAL_PATH = "/verify"

export const roleLabels = {
  GOVERNMENT: "Government / Regulator",
  MANUFACTURER: "Manufacturer",
  PHARMACY: "Pharmacy / Distributor",
  CONSUMER: "Consumer",
} as const

export type AppRole = keyof typeof roleLabels