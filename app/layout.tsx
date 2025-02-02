import type { ReactNode } from "react"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <script src="https://sdk.mercadopago.com/js/v2" />
      </head>
      <body>{children}</body>
    </html>
  )
}

