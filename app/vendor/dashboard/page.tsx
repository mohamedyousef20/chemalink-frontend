"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { MirvoryPageLoader } from "@/components/MirvoryLoader"

export default function VendorDashboardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/vendor/dashboard/overview")
  }, [router])

  return <MirvoryPageLoader />
}
