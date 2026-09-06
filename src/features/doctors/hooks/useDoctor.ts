"use client";

import { useCallback, useEffect, useState } from "react";
import type { Doctor } from "@/types/doctor";
import { getDoctor } from "@/features/doctors/api/doctorsClient";

type Status = "loading" | "ready" | "error";

export function useDoctor(doctorId: string) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  const load = useCallback(() => {
    return getDoctor(doctorId)
      .then((data) => {
        setDoctor(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [doctorId]);

  // Initial load: status already defaults to "loading", so no synchronous
  // state update is needed before the fetch resolves.
  useEffect(() => {
    load();
  }, [load]);

  // Imperative reload for retry buttons and post-submit refreshes — always
  // called from an event handler, so it's safe to flip to "loading" here.
  const refetch = useCallback(() => {
    setStatus("loading");
    load();
  }, [load]);

  return { doctor, status, refetch };
}
