"use client";

import { useEffect, useState, type FormEvent } from "react";
import { SPECIALTIES } from "@/lib/constants/specialties";
import { FormField, SelectField } from "@/features/doctor-portal/components/FormField";
import type { OwnerDoctorProfile } from "@/features/doctor-portal/api/doctorProfileClient";

type Patch = { bio: string; location: string; specialty: string; experienceYears: number };
type Props = {
  profile: OwnerDoctorProfile;
  onSave: (patch: Patch) => Promise<boolean>;
};

type Errors = Partial<Record<keyof Patch, string>>;

export function DoctorProfileDetailsForm({ profile, onSave }: Props) {
  const [bio, setBio] = useState(profile.bio);
  const [location, setLocation] = useState(profile.location);
  const [specialty, setSpecialty] = useState(profile.specialty);
  const [experienceYears, setExperienceYears] = useState(String(profile.experienceYears));
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Keep the form in sync if the profile is reloaded with different values
  // (e.g. after a slot action refetches it).
  useEffect(() => {
    setBio(profile.bio);
    setLocation(profile.location);
    setSpecialty(profile.specialty);
    setExperienceYears(String(profile.experienceYears));
  }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);

    const nextErrors: Errors = {};
    if (!bio.trim() || bio.trim().length < 20) {
      nextErrors.bio = "Add at least 20 characters so patients know what to expect.";
    }
    if (!location.trim()) nextErrors.location = "Practice location is required.";
    if (!specialty) nextErrors.specialty = "Please select a specialty.";
    const years = Number(experienceYears);
    if (!experienceYears.trim() || !Number.isFinite(years) || years < 0 || years > 60) {
      nextErrors.experienceYears = "Enter a value between 0 and 60.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const ok = await onSave({ bio: bio.trim(), location: location.trim(), specialty, experienceYears: years });
    setSaving(false);
    if (ok) setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          id="profile-specialty"
          label="Specialty"
          value={specialty}
          onChange={setSpecialty}
          options={SPECIALTIES}
          error={errors.specialty}
        />
        <FormField
          id="profile-experience"
          label="Years of experience"
          type="number"
          min={0}
          max={60}
          value={experienceYears}
          onChange={(event) => setExperienceYears(event.target.value)}
          error={errors.experienceYears}
        />
      </div>

      <FormField
        id="profile-location"
        label="Practice location"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        error={errors.location}
        placeholder="Room 5 · Main clinic"
      />

      <div>
        <label htmlFor="profile-bio" className="text-sm font-medium text-[var(--ink)]">
          Bio shown to patients
        </label>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          rows={4}
          aria-invalid={Boolean(errors.bio)}
          aria-describedby={errors.bio ? "profile-bio-error" : undefined}
          className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
        />
        {errors.bio && (
          <p id="profile-bio-error" className="mt-1.5 text-sm text-red-600">
            {errors.bio}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-sm font-medium text-emerald-700">Saved.</span>}
      </div>
    </form>
  );
}
