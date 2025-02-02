"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, CreditCard, Banknote, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Logo } from "@/components/Logo";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Script from "next/script";

const googleSheetsURL = "https://script.google.com/macros/s/AKfycbyLb9usiPsR9vOxk9sprjWEf19w4x-5B_bhDftOrybCOmcFRywXALT4RzL7TeUR5k0Dcg/exec";

const services = {
  nails: [
    { name: "Gel na tips", price: 120.0 },
    { name: "Manutenção gel", price: 60.0 },
    { name: "Banho de gel", price: 100.0 },
    { name: "Manicure", price: 35.0 },
    { name: "Pedicure", price: 35.0 },
    { name: "Combo Mani + Pedi", price: 60.0 },
  ],
  eyebrows: [
    { name: "Designer com Henna", price: 35.0 },
    { name: "Designer Natural", price: 25.0 },
  ],
};

const allTimes = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>(allTimes);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!name.trim() || !phone.trim()) throw new Error("Preencha seu nome e telefone");
      if (!date) throw new Error("Selecione uma data");
      if (!time) throw new Error("Selecione um horário");
      if (!selectedService) throw new Error("Selecione um serviço");

      console.log("✅ Enviando agendamento para Google Sheets...");
      const bookingData = {
        nome: name,
        telefone: phone,
        data: format(date, "yyyy-MM-dd"),
        horario: time,
        servico: selectedService,
        status: "Pendente",
      };

      await fetch(googleSheetsURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      console.log("📢 Criando pagamento no Mercado Pago...");
      const response = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: selectedService,
          price: 100,
          paymentMethod,
          date: format(date, "yyyy-MM-dd"),
          time,
          clientName: name,
          clientPhone: phone,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Erro ao criar preferência de pagamento");

      console.log("✅ Pagamento criado:", result);
      window.location.href = result.init_point;
    } catch (error: any) {
      console.error("❌ Erro ao processar agendamento:", error.message);
      alert(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://sdk.mercadopago.com/js/v2" strategy="lazyOnload" />
      <div className="min-h-screen bg-pink-50 p-4">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>Agendamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Label>Nome:</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />

              <Label>WhatsApp:</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required type="tel" />

              <Label>Serviço:</Label>
              <Select onValueChange={setSelectedService} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="section-nails" disabled className="font-semibold">
                    Unhas
                  </SelectItem>
                  {services.nails.map((service) => (
                    <SelectItem key={service.name} value={service.name}>
                      {service.name} - R${service.price.toFixed(2)}
                    </SelectItem>
                  ))}
                  <SelectItem value="section-eyebrows" disabled className="font-semibold">
                    Sobrancelhas
                  </SelectItem>
                  {services.eyebrows.map((service) => (
                    <SelectItem key={service.name} value={service.name}>
                      {service.name} - R${service.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Label>Data:</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Selecione"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus disabled={{ before: new Date() }} />
                </PopoverContent>
              </Popover>

              <Label>Horário:</Label>
              <Select value={time} onValueChange={setTime} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit" disabled={loading}>
                {loading ? "Processando..." : "Confirmar Agendamento"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
