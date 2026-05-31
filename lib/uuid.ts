export function createMedicineUuid() {
  return crypto.randomUUID()
}

export function normalizeUuid(value: string) {
  return value.trim().toLowerCase()
}