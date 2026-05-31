"use client"

import dynamic from "next/dynamic"

const SessionGuard = dynamic(() => import("./session-guard"), { ssr: false })

export default function SessionGuardWrapper() {
  return <SessionGuard />
}
