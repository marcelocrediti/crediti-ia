export function daysUntil(dateValue) {
  if (!dateValue) return null;

  const due = new Date(`${dateValue}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}

export function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Bom dia";
  if (hour >= 12 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function getServiceNotice() {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Fortaleza",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const weekday = parts.find((part) => part.type === "weekday")?.value || "";
  const hour = Number(parts.find((part) => part.type === "hour")?.value || 0);
  const minute = Number(parts.find((part) => part.type === "minute")?.value || 0);
  const currentMinutes = hour * 60 + minute;
  const isWeekend = weekday.startsWith("sáb") || weekday.startsWith("dom");
  const isOpen = !isWeekend && currentMinutes >= 460 && currentMinutes < 1020;

  if (isOpen) return "";

  if (isWeekend) {
    return "Nosso atendimento humano funciona de segunda a sexta, das 7h40 às 17h. Você pode enviar sua mensagem agora e receberá a resposta na segunda-feira.";
  }

  return "Nosso atendimento humano funciona de segunda a sexta, das 7h40 às 17h. Você pode enviar sua mensagem agora e receberá a resposta no próximo horário de atendimento.";
}
