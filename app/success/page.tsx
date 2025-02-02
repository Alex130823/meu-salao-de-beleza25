"use client"

import { useEffect, useState } from "react"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SuccessPage() {
  const [isUpdating, setIsUpdating] = useState(true)
  const [bookingInfo, setBookingInfo] = useState<any>(null)

  useEffect(() => {
    const updateSheet = async () => {
      const info = JSON.parse(sessionStorage.getItem("bookingInfo") || "{}")
      setBookingInfo(info)

      if (Object.keys(info).length === 0) {
        console.error("Informações de agendamento não encontradas")
        setIsUpdating(false)
        return
      }

      try {
        const response = await fetch("/api/update-sheet", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(info),
        })

        if (!response.ok) {
          throw new Error("Falha ao atualizar a planilha")
        }

        console.log("Planilha atualizada com sucesso")
      } catch (error) {
        console.error("Erro ao atualizar a planilha:", error)
      } finally {
        setIsUpdating(false)
      }
    }

    updateSheet()
  }, [])

  return (
    <div className="min-h-screen bg-pink-50 p-4 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
          <CardDescription>
            {isUpdating ? "Atualizando seu agendamento..." : "Seu agendamento foi realizado com sucesso"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {bookingInfo && (
            <div className="text-center">
              <p>
                <strong>Nome:</strong> {bookingInfo.name}
              </p>
              <p>
                <strong>Telefone:</strong> {bookingInfo.phone}
              </p>
              <p>
                <strong>Serviço:</strong> {bookingInfo.service}
              </p>
              <p>
                <strong>Data:</strong> {bookingInfo.date}
              </p>
              <p>
                <strong>Hora:</strong> {bookingInfo.time}
              </p>
            </div>
          )}
          <Button asChild>
            <Link href="/">Voltar ao Início</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

