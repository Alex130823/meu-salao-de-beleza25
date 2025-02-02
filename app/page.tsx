"use client";

import { useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/Logo";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

// URL do Google Sheets API
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbyUvB-jybTp3UhDvMRzTDYwn69K0ck_0wQNd6HpIrd-IBjhsC232c9dfgyQCVL_2v-uww/exec";

// Serviços disponíveis
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

// Lista de horários disponíveis
const allTimes = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState("");
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>(allTimes);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");

    try {
      // Validações
      if (!name || !phone) throw new Error("Preencha seu nome e telefone");
      if (!date || !time) throw new Error("Selecione data e horário");
      if (!selectedService) throw new Error("Selecione um serviço");

      // Verificar o serviço escolhido
      const selectedServiceData = [...services.nails, ...services.eyebrows].find(
        (service) => service.name === selectedService
      );

      if (!selectedServiceData) {
        throw new Error("Serviço não encontrado");
      }

      // Dados do agendamento
      const bookingData = {
        nome: name,
        telefone: phone,
        data: format(date, "yyyy-MM-dd"),
        horario: time,
        servico: selectedServiceData.name,
        status: "Pendente",
      };

      console.log("✅ Enviando agendamento para Google Sheets...", bookingData);

      // Enviar os dados para o Google Sheets
      const body = JSON.stringify(bookingData);
      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": body.length.toString(), // Adicionando Content-Length
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar dados para o Google Sheets");
      }

      const result = await response.json();
      if (result.status !== "success") {
        throw new Error(result.message || "Erro ao salvar no Google Sheets");
      }

      console.log("✅ Agendamento salvo no Google Sheets:", result);
      setSuccessMessage("Agendamento confirmado com sucesso!");

    } catch (error: any) {
      console.error("❌ Erro ao processar agendamento:", error.message);
      alert(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
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
            {/* Dados do Cliente */}
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

            {/* Seleção de Serviço */}
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

            {/* Seleção de Data */}
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

            {/* Seleção de Horário */}
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
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Confirmar Agendamento"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
