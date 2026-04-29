import type { Board, Card } from "../types";

/**
 * Generates an iCalendar (.ics) string from a board and its cards.
 * @param board The Enki Board
 * @param cards The cards belonging to the board
 * @returns A string in iCal format
 */
export const generateICalString = (board: Board, cards: Card[]): string => {
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  
  let ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Enki//Project Management//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${board.title}`,
    "X-WR-TIMEZONE:UTC",
  ];

  cards.forEach((card) => {
    if (!card.dueDate) return;

    const startDate = new Date(card.dueDate);
    const endDate = new Date(card.dueDate + 30 * 60 * 1000); // Default 30 min duration

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const description = (card.description || "Sem descrição")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");

    ics.push("BEGIN:VEVENT");
    ics.push(`UID:${card.id}@enki.app`);
    ics.push(`DTSTAMP:${now}`);
    ics.push(`DTSTART:${formatDate(startDate)}`);
    ics.push(`DTEND:${formatDate(endDate)}`);
    ics.push(`SUMMARY:${card.title}`);
    ics.push(`DESCRIPTION:${description}\\n\\nLink: ${window.location.origin}/board/${board.id}`);
    ics.push("STATUS:CONFIRMED");
    ics.push("END:VEVENT");
  });

  ics.push("END:VCALENDAR");

  return ics.join("\r\n");
};

/**
 * Triggers a download of a generated iCal file.
 */
export const downloadICalFile = (boardTitle: string, icsContent: string) => {
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${boardTitle.replace(/\s+/g, "_")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
