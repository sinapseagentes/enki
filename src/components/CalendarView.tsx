import React, { useState } from "react";
import type { Card, Board } from "../types";

interface CalendarViewProps {
  cards: Card[];
  board: Board;
  onCardClick: (card: Card) => void;
  scribeMode?: boolean;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ cards, onCardClick, scribeMode }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const days = [];
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  // Fill empty days at start
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Fill actual days
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, month, i));
  }

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const monthNamesScribe = [
    "Mês de Anu", "Mês de Enlil", "Mês de Enki", "Mês de Ninhursag",
    "Mês de Nanna", "Mês de Utu", "Mês de Inanna", "Mês de Marduk",
    "Mês de Nabu", "Mês de Nergal", "Mês de Ninurta", "Mês de Dumuzi"
  ];

  return (
    <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
        <h2 className="text-xl font-bold text-white flex items-center gap-4">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="min-w-[200px] text-center">
            {scribeMode ? monthNamesScribe[month] : monthNames[month]} {year}
          </span>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </h2>
        <button 
          onClick={() => setCurrentDate(new Date())}
          className="px-4 py-2 bg-white text-blue-600 rounded-lg font-bold text-sm shadow-lg hover:bg-blue-50 transition-colors"
        >
          Hoje
        </button>
      </div>

      <div className={`grid grid-cols-7 gap-px rounded-xl overflow-hidden shadow-2xl border ${scribeMode ? 'bg-amber-200 border-amber-300' : 'bg-gray-200 dark:bg-slate-700 border-gray-100 dark:border-white/5'}`}>
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(d => (
          <div key={d} className={`p-4 text-center text-[10px] font-bold uppercase tracking-widest ${scribeMode ? 'bg-amber-100 text-amber-900' : 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500'}`}>
            {d}
          </div>
        ))}
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className={`${scribeMode ? 'bg-amber-50/30' : 'bg-gray-50/30 dark:bg-slate-800/30'}`} />;
          
          const isToday = date.toDateString() === new Date().toDateString();
          const dayCards = cards.filter(c => c.dueDate && new Date(c.dueDate).toDateString() === date.toDateString());

          return (
            <div 
              key={date.toISOString()} 
              className={`min-h-[120px] p-2 transition-colors flex flex-col gap-1 ${scribeMode ? 'bg-amber-50/80 hover:bg-amber-100/90' : 'bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'}`}
            >
              <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'text-gray-400'}`}>
                {date.getDate()}
              </span>
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                {dayCards.map(card => (
                  <div 
                    key={card.id}
                    onClick={() => onCardClick(card)}
                    className={`text-[10px] p-1.5 rounded border border-transparent hover:border-blue-500 cursor-pointer transition-all truncate shadow-sm ${
                      scribeMode 
                        ? 'bg-amber-200/50 text-amber-900' 
                        : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    }`}
                    title={card.title}
                  >
                    {card.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
