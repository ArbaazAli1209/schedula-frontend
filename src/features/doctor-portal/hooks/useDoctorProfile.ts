"use client";

import { useCallback, useEffect, useState } from "react";
import type { DoctorSlot } from "@/types/doctor";
import {
  addDoctorSlots,
  getOwnDoctorProfile,
  removeDoctorSlot,
  updateDoctorProfile,
  type OwnerDoctorProfile,
} from "@/features/doctor-portal/api/doctorProfileClient";

type Status = "loading" | "ready" | "error";
type DetailsPatch = Parameters<typeof updateDoctorProfile>[1];

export function useDoctorProfile(doctorId: string | undefined) {
  const [profile, setProfile] = useState<OwnerDoctorProfile | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!doctorId) return Promise.resolve();
    return getOwnDoctorProfile(doctorId)
      .then((data) => {
        setProfile(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [doctorId]);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => {
    setStatus("loading");
    load();
  }, [load]);

  const saveDetails = useCallback(
    async (patch: DetailsPatch) => {
      if (!doctorId) return false;
      setActionError(null);
      try {
        await updateDoctorProfile(doctorId, patch);
        await load();
        return true;
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Unable to update your profile.");
        return false;
      }
    },
    [doctorId, load],
  );

  const addSlots = useCallback(
    async (slots: DoctorSlot[]) => {
      if (!doctorId) return false;
      setActionError(null);
      try {
        await addDoctorSlots(doctorId, slots);
        await load();
        return true;
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Unable to add slot.");
        return false;
      }
    },
    [doctorId, load],
  );

  const removeSlot = useCallback(
    async (startsAt: string) => {
      if (!doctorId) return false;
      setActionError(null);
      try {
        await removeDoctorSlot(doctorId, startsAt);
        await load();
        return true;
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Unable to remove slot.");
        return false;
      }
    },
    [doctorId, load],
  );

  return { profile, status, actionError, refetch, saveDetails, addSlots, removeSlot };
}
