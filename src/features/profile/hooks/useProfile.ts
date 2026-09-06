"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserProfile } from "@/types/user";
import { getProfile, updateProfile, type ProfilePatch } from "@/features/profile/api/profileClient";

type Status = "loading" | "ready" | "error";

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!userId) return Promise.resolve();
    return getProfile(userId)
      .then((data) => {
        setProfile(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const refetch = useCallback(() => {
    setStatus("loading");
    return load();
  }, [load]);

  const save = useCallback(
    async (patch: ProfilePatch) => {
      if (!userId) return false;
      setActionError(null);
      try {
        const updated = await updateProfile(userId, patch);
        setProfile(updated);
        return true;
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Unable to update your profile.");
        return false;
      }
    },
    [userId],
  );

  return { profile, status, actionError, refetch, save };
}
