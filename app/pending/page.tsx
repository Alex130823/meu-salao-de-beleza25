import { Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-pink-50 p-4 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl">Pagamento em Processamento</CardTitle>
          <CardDescription>Aguardando a confirmação do seu pagamento</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/">Voltar ao Início</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

