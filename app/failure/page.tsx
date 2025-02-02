import { XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-pink-50 p-4 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Pagamento não Concluído</CardTitle>
          <CardDescription>Houve um problema ao processar seu pagamento</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button asChild>
            <Link href="/">Tentar Novamente</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

