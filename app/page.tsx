"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, CreditCard, Banknote, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Script from "next/script";
import { Logo } from "@/components/Logo";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzgpHczfbjp-sE8DjTxb4qu_WVlz_yN1zIFjojOqgNtUHqsIdGhoMQGiCL_voYAp6ZSEQ/exec";

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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>(allTimes);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (date) {
      setAvailableTimes(allTimes);
    }
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!name || !phone) throw new Error("Preencha seu nome e telefone");
      if (!date || !time) throw new Error("Selecione data e horário");
      if (!selectedService) throw new Error("Selecione um serviço");

      const selectedServiceData = [...services.nails, ...services.eyebrows].find(
        (service) => service.name === selectedService
      );

      if (!selectedServiceData) {
        throw new Error("Serviço não encontrado");
      }

      const bookingData = {
        nome: name,
        telefone: phone,
        data: format(date, "yyyy-MM-dd"),
        horario: time,
        servico: selectedServiceData.name,
        status: "Pendente",
      };

      console.log("✅ Enviando agendamento para Google Sheets...", bookingData);

      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();
      if (result.status !== "success") throw new Error("Erro ao salvar no Google Sheets");

      console.log("✅ Agendamento salvo no Google Sheets:", result);
      alert("Agendamento confirmado!");

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
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CalendarIcon className="h-6 w-6 text-pink-600" />
              Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Dados do Cliente</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Nome completo" value={name} onChange={(e) => setName(e.target.value)} required />
                  <Input
                    placeholder="WhatsApp (11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    type="tel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Serviço</Label>
                <Select onValueChange={setSelectedService} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(services).map(([category, items]) => (
                      <div key={category}>
                        <SelectItem value={`section-${category}`} disabled className="font-semibold">
                          {category === "nails" ? "Unhas" : "Sobrancelhas"}
                        </SelectItem>
                        {items.map((service) => (
                          <SelectItem key={service.name} value={service.name}>
                            {service.name} - R${service.price.toFixed(2)}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy") : "Selecione"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Horário</Label>
                <Select value={time} onValueChange={setTime} disabled={!date}>
                  <SelectTrigger>
                    <SelectValue placeholder={date ? "Selecione" : "Escolha a data primeiro"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimes.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700" disabled={loading}>
                {loading ? "Processando..." : "Confirmar Agendamento"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
