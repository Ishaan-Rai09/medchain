"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

export default function useZodForm(schema: any, options?: any) {
  return useForm({ resolver: zodResolver(schema), ...options })
}
