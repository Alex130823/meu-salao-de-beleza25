import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("🚀 Enviando dados para o Google Sheets...");
    console.log("🔍 Dados recebidos:", body);

    const sheetsResponse = await fetch("https://script.google.com/macros/s/AKfycby1D-GDlVT26Euv_1GlkftbLlN3Mr20V-S_kBeySYui8q-rgJr4G_ab2YcVxWKPiPhpJA/exec", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await sheetsResponse.text();

    console.log("✅ Resposta do Google Sheets:", result);

    return NextResponse.json({ success: true, message: "Dados enviados para Google Sheets", response: result });
  } catch (error: any) {
    console.error("❌ ERRO na API update-sheet:", error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
