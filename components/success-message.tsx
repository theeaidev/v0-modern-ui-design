"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface SuccessMessageProps {
  title: string
  message: string
  redirectPath: string
  redirectLabel: string
  autoRedirectSeconds?: number
}

export function SuccessMessage({
  title,
  message,
  redirectPath,
  redirectLabel,
  autoRedirectSeconds = 5,
}: SuccessMessageProps) {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectPath)
    }, autoRedirectSeconds * 1000)

    return () => clearTimeout(timer)
  }, [router, redirectPath, autoRedirectSeconds])

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="flex flex-col items-center text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center">{message}</p>
        <p className="text-center text-sm text-muted-foreground mt-2">
          Serás redirigido en {autoRedirectSeconds} segundos...
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={() => router.push(redirectPath)}>{redirectLabel}</Button>
      </CardFooter>
    </Card>
  )
}
