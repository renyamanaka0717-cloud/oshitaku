import { create } from 'zustand';
import { CalendarEvent } from '@/db/models';
import { calendarEventRepository } from '@/db/repositories';

type CalendarState = {
  childId: string | null;
  events: CalendarEvent[];
  load: (childId: string) => Promise<void>;
  createEvent: (input: { title: string; date: string; icon: string }) => Promise<void>;
  updateEvent: (id: string, input: Partial<Pick<CalendarEvent, 'title' | 'date' | 'icon'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
};

export const useCalendarStore = create<CalendarState>((set, get) => ({
  childId: null,
  events: [],

  load: async (childId: string) => {
    const events = await calendarEventRepository.listCalendarEvents(childId);
    set({ childId, events });
  },

  createEvent: async (input) => {
    const childId = get().childId!;
    const event = await calendarEventRepository.createCalendarEvent({ childId, ...input });
    const events = [...get().events, event].sort((a, b) => (a.date < b.date ? -1 : 1));
    set({ events });
  },

  updateEvent: async (id, input) => {
    await calendarEventRepository.updateCalendarEvent(id, input);
    const events = get()
      .events.map((e) => (e.id === id ? { ...e, ...input } : e))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
    set({ events });
  },

  deleteEvent: async (id: string) => {
    await calendarEventRepository.deleteCalendarEvent(id);
    set({ events: get().events.filter((e) => e.id !== id) });
  },
}));
