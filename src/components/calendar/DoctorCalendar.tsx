"use client";

import { useEffect, useMemo, useState } from "react";
import type { Appointment } from "@/types/appointment";
import { getOwnDoctorProfile, type OwnerSlot } from "@/features/doctor-portal/api/doctorProfileClient";
import { useDoctorAppointments } from "@/features/doctor-portal/hooks/useDoctorAppointments";
import { rescheduleAppointment } from "@/features/appointments/api/appointmentsClient";
import { isReadOnly } from "@/lib/utils/appointments";
import { toDateKey, startOfWeek, addDays, buildMonthGrid } from "@/lib/utils/calendar";
import { StatusBadge } from "@/components/appointments/StatusBadge";
import { computeDisplayStatus } from "@/lib/utils/appointments";

type View = "day" | "week" | "month";

const timeFormatter = new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" });
const dayFormatter = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" });
const monthFormatter = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });
const weekdayShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type DayEntry =
  | { kind: "appointment"; startsAt: string; appointment: Appointment }
  | { kind: "slot"; startsAt: string; slot: OwnerSlot };

export function DoctorCalendar({
  doctorId,
  clinicianName,
  initialDate,
}: {
  doctorId: string | undefined;
  clinicianName: string | undefined;
  initialDate?: string;
}) {
  const [view, setView] = useState<View>("day");
  const [anchor, setAnchor] = useState<Date>(() => (initialDate ? new Date(`${initialDate}T00:00:00`) : new Date()));
  const [slots, setSlots] = useState<OwnerSlot[]>([]);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [dragError, setDragError] = useState<string | null>(null);
  const { appointments, refetch: refetchAppointments } = useDoctorAppointments(clinicianName);

  function loadSlots() {
    if (!doctorId) return;
    getOwnDoctorProfile(doctorId)
      .then((profile) => setSlots(profile.slots))
      .catch(() => setSlotsError("Couldn't load your availability."));
  }

  useEffect(loadSlots, [doctorId]);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, DayEntry[]>();
    for (const appointment of appointments) {
      const key = appointment.startsAt.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push({ kind: "appointment", startsAt: appointment.startsAt, appointment });
      map.set(key, list);
    }
    for (const slot of slots) {
      if (slot.isBooked) continue; // booked slots are represented by their appointment already
      const key = slot.startsAt.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push({ kind: "slot", startsAt: slot.startsAt, slot });
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    }
    return map;
  }, [appointments, slots]);

  async function handleDrop(targetStartsAt: string, appointmentId: string) {
    setDragError(null);
    try {
      await rescheduleAppointment(appointmentId, targetStartsAt);
      refetchAppointments();
      loadSlots();
    } catch (err) {
      setDragError(err instanceof Error ? err.message : "Couldn't move this appointment there.");
    }
  }

  function goToDay(date: Date) {
    setAnchor(date);
    setView("day");
  }

  const days = view === "week" ? weekDays(anchor) : view === "day" ? [anchor] : [];

  return (
    <div className="rounded-xl border border-[var(--line)] bg-white">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setAnchor(step(anchor, view, -1))} aria-label="Previous" className="grid size-8 place-items-center rounded-lg border border-[var(--line)] hover:border-[var(--brand)]">
            ←
          </button>
          <p className="min-w-[10rem] text-center font-semibold sm:text-left">
            {view === "month" ? monthFormatter.format(anchor) : view === "week" ? `Week of ${dayFormatter.format(startOfWeek(anchor))}` : dayFormatter.format(anchor)}
          </p>
          <button type="button" onClick={() => setAnchor(step(anchor, view, 1))} aria-label="Next" className="grid size-8 place-items-center rounded-lg border border-[var(--line)] hover:border-[var(--brand)]">
            →
          </button>
          <button type="button" onClick={() => setAnchor(new Date())} className="ml-1 text-sm font-semibold text-[var(--brand)] hover:underline">
            Today
          </button>
        </div>
        <div className="flex gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Calendar view">
          {(["day", "week", "month"] as View[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              className={`rounded-md px-3 py-1.5 text-sm capitalize ${view === item ? "bg-white font-medium shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {(slotsError || dragError) && (
        <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {dragError ?? slotsError}
        </p>
      )}

      {view === "month" ? (
        <MonthGrid anchor={anchor} entriesByDay={entriesByDay} onSelectDay={goToDay} />
      ) : (
        <div className={`grid gap-px overflow-x-auto bg-[var(--line)] p-px ${view === "week" ? "grid-cols-7" : "grid-cols-1"}`}>
          {days.map((day) => (
            <DayColumn
              key={toDateKey(day)}
              date={day}
              entries={entriesByDay.get(toDateKey(day)) ?? []}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function step(date: Date, view: View, direction: 1 | -1): Date {
  if (view === "day") return addDays(date, direction);
  if (view === "week") return addDays(date, direction * 7);
  return new Date(date.getFullYear(), date.getMonth() + direction, 1);
}

function DayColumn({
  date,
  entries,
  onDrop,
}: {
  date: Date;
  entries: DayEntry[];
  onDrop: (targetStartsAt: string, appointmentId: string) => void;
}) {
  const isToday = toDateKey(date) === toDateKey(new Date());
  return (
    <div className="min-h-[16rem] bg-white p-3">
      <p className={`mb-2 text-sm font-semibold ${isToday ? "text-[var(--brand-deep)]" : ""}`}>{dayFormatter.format(date)}</p>
      <div className="space-y-2">
        {entries.length === 0 && <p className="text-xs text-[var(--muted)]">No appointments or open slots.</p>}
        {entries.map((entry) =>
          entry.kind === "appointment" ? (
            <AppointmentBlock key={entry.appointment.id} appointment={entry.appointment} />
          ) : (
            <SlotBlock key={entry.startsAt} startsAt={entry.startsAt} onDrop={onDrop} />
          ),
        )}
      </div>
    </div>
  );
}

function AppointmentBlock({ appointment }: { appointment: Appointment }) {
  const draggable = !isReadOnly(appointment.status);
  return (
    <div
      draggable={draggable}
      onDragStart={(event) => {
        if (!draggable) return;
        event.dataTransfer.setData("text/plain", appointment.id);
      }}
      className={`rounded-lg border p-2 text-xs ${
        draggable ? "cursor-grab border-emerald-200 bg-emerald-50 active:cursor-grabbing" : "cursor-not-allowed border-[var(--line)] bg-stone-50"
      }`}
      title={draggable ? "Drag to an open slot to reschedule" : "Read-only"}
    >
      <p className="font-semibold">{timeFormatter.format(new Date(appointment.startsAt))}</p>
      <p className="truncate">{appointment.patient.name}</p>
      <StatusBadge status={computeDisplayStatus(appointment)} className="mt-1" />
    </div>
  );
}

function SlotBlock({ startsAt, onDrop }: { startsAt: string; onDrop: (targetStartsAt: string, appointmentId: string) => void }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const id = event.dataTransfer.getData("text/plain");
        if (id) onDrop(startsAt, id);
      }}
      className={`rounded-lg border border-dashed p-2 text-xs text-[var(--muted)] ${
        over ? "border-[var(--brand)] bg-emerald-50" : "border-[var(--line)]"
      }`}
    >
      <p className="font-medium">{timeFormatter.format(new Date(startsAt))}</p>
      <p>Open slot</p>
    </div>
  );
}

function MonthGrid({
  anchor,
  entriesByDay,
  onSelectDay,
}: {
  anchor: Date;
  entriesByDay: Map<string, DayEntry[]>;
  onSelectDay: (date: Date) => void;
}) {
  const grid = buildMonthGrid(anchor);
  const currentMonth = anchor.getMonth();

  return (
    <div>
      <div className="grid grid-cols-7 border-b border-[var(--line)] text-center text-xs font-semibold text-[var(--muted)]">
        {weekdayShort.map((label) => (
          <div key={label} className="py-2">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-[var(--line)] p-px">
        {grid.map((date) => {
          const key = toDateKey(date);
          const entries = entriesByDay.get(key) ?? [];
          const appointmentCount = entries.filter((entry) => entry.kind === "appointment").length;
          const inMonth = date.getMonth() === currentMonth;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay(date)}
              className={`min-h-[5rem] bg-white p-2 text-left hover:bg-emerald-50/40 ${inMonth ? "" : "text-[var(--muted)]"}`}
            >
              <span className="text-sm font-medium">{date.getDate()}</span>
              {appointmentCount > 0 && (
                <span className="mt-1 block w-fit rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-[var(--brand-deep)]">
                  {appointmentCount} visit{appointmentCount === 1 ? "" : "s"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
