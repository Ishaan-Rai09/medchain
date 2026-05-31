import { ObjectId } from "mongodb"

export function toObjectId(value: string): ObjectId | null {
  if (!ObjectId.isValid(value)) {
    return null
  }

  return new ObjectId(value)
}
