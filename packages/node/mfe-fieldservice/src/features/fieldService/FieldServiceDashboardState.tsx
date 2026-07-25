import React, { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { operatingHoursSlice, territoriesSlice, resourcesSlice, appointmentsSlice } from "./fieldServiceSlice";
import { Clock, MapPin, Users, CalendarDays } from "lucide-react";

export function useFieldServiceDashboardState() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const operatingHours = useAppSelector((s) => s.fieldService.operatingHours.items.data) ?? [];
  const territories = useAppSelector((s) => s.fieldService.territories.items.data) ?? [];
  const resources = useAppSelector((s) => s.fieldService.resources.items.data) ?? [];
  const appointments = useAppSelector((s) => s.fieldService.appointments.items.data) ?? [];

  const stats = useMemo(() => ({
    operatingHours: operatingHours.length,
    territories: territories.length,
    resources: resources.length,
    appointments: appointments.length,
  }), [operatingHours.length, territories.length, resources.length, appointments.length]);

  const sections = useMemo(() => [
    {
      title: "Operating Hours",
      description: "Define time slots, shifts, and global regional timezones for work shifts.",
      count: stats.operatingHours,
      icon: Clock,
      href: "/field-service/operating-hours",
      color: "text-indigo-400 border-indigo-500/20 bg-indigo-950/20",
    },
    {
      title: "Service Territories",
      description: "Manage physical region sectors, assignments, and bind operating hours.",
      count: stats.territories,
      icon: MapPin,
      href: "/field-service/territories",
      color: "text-emerald-400 border-emerald-500/20 bg-emerald-950/20",
    },
    {
      title: "Service Resources",
      description: "Administer field technicians, equipment crews, capacities, and skills.",
      count: stats.resources,
      icon: Users,
      href: "/field-service/resources",
      color: "text-amber-400 border-amber-500/20 bg-amber-950/20",
    },
    {
      title: "Service Appointments",
      description: "Schedule parent work orders, match candidates, and dispatch assignments.",
      count: stats.appointments,
      icon: CalendarDays,
      href: "/field-service/appointments",
      color: "text-blue-400 border-blue-500/20 bg-blue-950/20",
    },
  ], [stats]);

  const fetchAll = useCallback(() => {
    dispatch(operatingHoursSlice.actions.fetchRequest(undefined));
    dispatch(territoriesSlice.actions.fetchRequest(undefined));
    dispatch(resourcesSlice.actions.fetchRequest(undefined));
    dispatch(appointmentsSlice.actions.fetchRequest(undefined));
  }, [dispatch]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    router,
    dispatch,
    operatingHours,
    territories,
    resources,
    appointments,
    stats,
    sections,
  };
}
