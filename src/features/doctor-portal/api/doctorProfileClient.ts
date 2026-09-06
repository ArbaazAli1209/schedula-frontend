import type { Doctor, DoctorSlot } from "@/types/doctor";

export type OwnerSlot = DoctorSlot & { isBooked: boolean };
export type OwnerDoctorProfile = Omit<Doctor, "slots"> & { slots: OwnerSlot[] };

export async function getOwnDoctorProfile(doctorId: string): Promise<OwnerDoctorProfile> {
  const response = await fetch(`/api/doctors/${doctorId}?includeBooked=1`);
  if (!response.ok) throw new Error("Unable to load your profile.");
  const body: { data: OwnerDoctorProfile } = await response.json();
  return body.data;
}

export async function updateDoctorProfile(
  doctorId: string,
  patch: Partial<Pick<Doctor, "bio" | "location" | "specialty" | "experienceYears">>,
): Promise<Doctor> {
  const response = await fetch(`/api/doctors/${doctorId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error ?? "Unable to update your profile.");
  return body.data as Doctor;
}

export async function addDoctorSlots(doctorId: string, slots: DoctorSlot[]): Promise<DoctorSlot[]> {
  const response = await fetch(`/api/doctors/${doctorId}/slots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slots }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error ?? "Unable to add slot.");
  return body.data as DoctorSlot[];
}

export async function removeDoctorSlot(doctorId: string, startsAt: string): Promise<DoctorSlot[]> {
  const response = await fetch(`/api/doctors/${doctorId}/slots`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startsAt }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error ?? "Unable to remove slot.");
  return body.data as DoctorSlot[];
}
