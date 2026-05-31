import {
  getDrugTypesCollection,
  getMedicineBatchesCollection,
  getMedicineUnitsCollection,
  getTransferLogsCollection,
} from "@/lib/mongo"
import { toObjectId } from "@/lib/object-id"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params

  const unitsCollection = await getMedicineUnitsCollection()
  const unit = await unitsCollection.findOne({ uuid })

  if (!unit) {
    return NextResponse.json(
      {
        authenticity: "NOT_FOUND",
        message: "Medicine unit not found",
      },
      { status: 404 }
    )
  }

  const [resolvedBatch, timeline] = await Promise.all([
    getMedicineBatchesCollection().then((collection) => collection.findOne({ unitUuids: uuid })),
    getTransferLogsCollection().then((collection) => collection.find({ unitUuid: uuid }).sort({ transferDate: 1 }).toArray()),
  ])

  const drugTypeId = toObjectId(unit.drugTypeId)
  const drugType = drugTypeId
    ? await getDrugTypesCollection().then((collection) => collection.findOne({ _id: drugTypeId }))
    : null

  const statusAnomaly =
    unit.status === "SOLD_TO_CONSUMER" && unit.currentOwnerType !== "CONSUMER"
      ? true
      : unit.status === "AT_PHARMACY" && unit.currentOwnerType !== "PHARMACY"
        ? true
        : false

  return NextResponse.json({
    authenticity: statusAnomaly ? "FLAGGED" : unit.authenticity,
    uuid: unit.uuid,
    currentStatus: unit.status,
    currentOwnerType: unit.currentOwnerType,
    drug: {
      drugTypeId: unit.drugTypeId,
      batchNumber: resolvedBatch?.batchNumber,
      manufacturingDate: resolvedBatch?.manufacturingDate,
      expiryDate: resolvedBatch?.expiryDate,
      details: {
        drugName: drugType?.drugName,
        genericName: drugType?.genericName,
        category: drugType?.category,
        dosageForm: drugType?.dosageForm,
        strength: drugType?.strength,
      },
    },
    timeline: timeline.map((entry) => ({
      transferDate: entry.transferDate,
      fromOwnerType: entry.fromOwnerType,
      toOwnerType: entry.toOwnerType,
      status: entry.status,
      notes: entry.notes,
      prescriptionReference: entry.prescriptionReference,
    })),
  })
}
