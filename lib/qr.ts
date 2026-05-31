import QRCode from "qrcode"

export async function generateUnitQrDataUrl(payload: string) {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 8,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF",
    },
  })
}