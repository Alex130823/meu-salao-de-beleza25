import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, price, paymentMethod, date, time, clientName, clientPhone } = await req.json();

    // Validação dos dados recebidos
    if (!title || !price || !clientName || !clientPhone || !date || !time) {
      return NextResponse.json({ error: "Dados incompletos para criar a preferência de pagamento" }, { status: 400 });
    }

    // Criar a preferência de pagamento no Mercado Pago
    const mercadoPagoResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title,
            quantity: 1,
            currency_id: "BRL",
            unit_price: price,
          },
        ],
        payer: {
          name: clientName,
          email: clientPhone.replace(/\D/g, "") + "@email.com",
          phone: {
            number: clientPhone,
          },
        },
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 1,
        },
        metadata: {
          clientName,
          clientPhone,
          date,
          time,
        },
        notification_url: "https://seusite.com/api/webhook",
        redirect_urls: {
          success: "https://seusite.com/success",
          failure: "https://seusite.com/failure",
          pending: "https://seusite.com/pending",
        },
      }),
    });

    const mercadoPagoResult = await mercadoPagoResponse.json();

    if (!mercadoPagoResponse.ok) {
      throw new Error(mercadoPagoResult.message || "Erro ao criar preferência no Mercado Pago");
    }

    console.log("✅ Pagamento criado:", mercadoPagoResult);

    // **Salvar no Google Sheets**
    const googleSheetsResponse = await fetch(
      "https://script.google.com/macros/s/AKfycby1D-GDlVT26Euv_1GlkftbLlN3Mr20V-S_kBeySYui8q-rgJr4G_ab2YcVxWKPiPhpJA/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: clientName,
          telefone: clientPhone,
          data: date,
          horario: time,
          status: "Pendente",
        }),
      }
    );

    const googleSheetsResult = await googleSheetsResponse.json();

    if (!googleSheetsResponse.ok) {
      throw new Error("Erro ao salvar no Google Sheets.");
    }

    console.log("✅ Agendamento salvo no Google Sheets:", googleSheetsResult);

    return NextResponse.json({
      id: mercadoPagoResult.id,
      init_point: mercadoPagoResult.init_point,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
