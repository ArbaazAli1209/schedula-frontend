"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { UserProfile } from "@/types/user";
import { FormField, SelectField } from "@/features/doctor-portal/components/FormField";
import type { ProfilePatch } from "@/features/profile/api/profileClient";

type Props = {
  profile: UserProfile;
  onSave: (patch: ProfilePatch) => Promise<boolean>;
};

const GENDER_OPTIONS = ["female", "male", "other", "prefer-not-to-say"];

function toList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** User Portal profile form: personal info, physical details, medical history, insurance, and emergency contact. */
export function ProfileDetailsForm({ profile, onSave }: Props) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth);
  const [gender, setGender] = useState(profile.gender);
  const [address, setAddress] = useState(profile.address);
  const [heightCm, setHeightCm] = useState(profile.heightCm != null ? String(profile.heightCm) : "");
  const [weightKg, setWeightKg] = useState(profile.weightKg != null ? String(profile.weightKg) : "");
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup);
  const [medicalConditions, setMedicalConditions] = useState(profile.medicalConditions.join(", "));
  const [allergies, setAllergies] = useState(profile.allergies.join(", "));
  const [currentMedications, setCurrentMedications] = useState(profile.currentMedications.join(", "));
  const [insuranceProvider, setInsuranceProvider] = useState(profile.insurance.provider);
  const [policyNumber, setPolicyNumber] = useState(profile.insurance.policyNumber);
  const [contactName, setContactName] = useState(profile.emergencyContact.name);
  const [contactRelationship, setContactRelationship] = useState(profile.emergencyContact.relationship);
  const [contactPhone, setContactPhone] = useState(profile.emergencyContact.phone);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Keep the form in sync if the profile is reloaded with different values.
  useEffect(() => {
    setName(profile.name);
    setPhone(profile.phone);
    setDateOfBirth(profile.dateOfBirth);
    setGender(profile.gender);
    setAddress(profile.address);
    setHeightCm(profile.heightCm != null ? String(profile.heightCm) : "");
    setWeightKg(profile.weightKg != null ? String(profile.weightKg) : "");
    setBloodGroup(profile.bloodGroup);
    setMedicalConditions(profile.medicalConditions.join(", "));
    setAllergies(profile.allergies.join(", "));
    setCurrentMedications(profile.currentMedications.join(", "));
    setInsuranceProvider(profile.insurance.provider);
    setPolicyNumber(profile.insurance.policyNumber);
    setContactName(profile.emergencyContact.name);
    setContactRelationship(profile.emergencyContact.relationship);
    setContactPhone(profile.emergencyContact.phone);
  }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    const height = heightCm.trim() ? Number(heightCm) : null;
    const weight = weightKg.trim() ? Number(weightKg) : null;
    if (height !== null && (!Number.isFinite(height) || height < 0 || height > 300)) {
      setError("Height must be between 0 and 300 cm.");
      return;
    }
    if (weight !== null && (!Number.isFinite(weight) || weight < 0 || weight > 500)) {
      setError("Weight must be between 0 and 500 kg.");
      return;
    }

    setSaving(true);
    const ok = await onSave({
      name: name.trim(),
      phone: phone.trim(),
      dateOfBirth,
      gender,
      address: address.trim(),
      heightCm: height,
      weightKg: weight,
      bloodGroup,
      medicalConditions: toList(medicalConditions),
      allergies: toList(allergies),
      currentMedications: toList(currentMedications),
      insurance: { provider: insuranceProvider.trim(), policyNumber: policyNumber.trim() },
      emergencyContact: {
        name: contactName.trim(),
        relationship: contactRelationship.trim(),
        phone: contactPhone.trim(),
      },
    });
    setSaving(false);
    if (ok) setSaved(true);
    else setError((prev) => prev ?? "Unable to save your profile.");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {error}
        </p>
      )}

      <section>
        <h3 className="text-sm font-semibold text-[var(--ink)]">Personal information</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <FormField id="profile-name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <FormField id="profile-email" label="Email" value={profile.email} disabled />
          <FormField id="profile-phone" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <FormField
            id="profile-dob"
            label="Date of birth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
          <SelectField id="profile-gender" label="Gender" value={gender} onChange={setGender} options={GENDER_OPTIONS} />
          <FormField id="profile-address" label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[var(--ink)]">Physical details</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <FormField id="profile-height" label="Height (cm)" type="number" min={0} max={300} value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          <FormField id="profile-weight" label="Weight (kg)" type="number" min={0} max={500} value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          <FormField id="profile-blood" label="Blood group" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} placeholder="e.g. O+" />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[var(--ink)]">Medical conditions &amp; allergies</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <FormField
            id="profile-conditions"
            label="Medical conditions"
            value={medicalConditions}
            onChange={(e) => setMedicalConditions(e.target.value)}
            placeholder="Comma-separated, e.g. Asthma, Hypertension"
          />
          <FormField
            id="profile-allergies"
            label="Allergies"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="Comma-separated, e.g. Penicillin"
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[var(--ink)]">Current medications</h3>
        <div className="mt-3">
          <FormField
            id="profile-medications"
            label="Medications"
            value={currentMedications}
            onChange={(e) => setCurrentMedications(e.target.value)}
            placeholder="Comma-separated, e.g. Albuterol inhaler"
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[var(--ink)]">Insurance details</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <FormField id="profile-insurance-provider" label="Provider" value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} />
          <FormField id="profile-insurance-policy" label="Policy number" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[var(--ink)]">Emergency contact</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          <FormField id="profile-contact-name" label="Name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          <FormField id="profile-contact-relationship" label="Relationship" value={contactRelationship} onChange={(e) => setContactRelationship(e.target.value)} />
          <FormField id="profile-contact-phone" label="Phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </div>
      </section>

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
