import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, service, date, time } = body

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO,
      subject: "Novo Agendamento",
      text: `
        Novo agendamento realizado:
        Nome: ${name}
        Telefone: ${phone}
        Serviço: ${service}
        Data: ${date}
        Hora: ${time}
      `,
    }

    await transporter.sendMail(mailOptions)

    return NextResponse.json({ message: "Email enviado com sucesso" })
  } catch (error: any) {
    console.error("Erro ao enviar email:", error)
    return NextResponse.json({ error: "Erro ao enviar email", details: error.message }, { status: 500 })
  }
}

