"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Gender } from "@/types/doctorAccount";
import { SPECIALTIES } from "@/lib/constants/specialties";
import { useDoctorRegistration } from "@/features/doctor-portal/hooks/useDoctorRegistration";
import { FormField, SelectField } from "@/features/doctor-portal/components/FormField";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9()\-\s]{7,20}$/;
const POSTAL_PATTERN = /^[0-9A-Za-z\-\s]{4,10}$/;
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

type FormValues = {
  fullName: string;
  gender: Gender | "";
  dateOfBirth: string;
  specialty: string;
  qualification: string;
  registrationNumber: string;
  experienceYears: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  password: string;
  confirmPassword: string;
};

const initialValues: FormValues = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  specialty: "",
  qualification: "",
  registrationNumber: "",
  experienceYears: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  password: "",
  confirmPassword: "",
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

/** Returns the person's age in whole years, or null if the date is invalid. */
function calculateAge(dateOfBirth: string): number | null {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.fullName.trim()) errors.fullName = "Full name is required.";

  if (!values.gender) errors.gender = "Please select a gender.";

  if (!values.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
  } else {
    const age = calculateAge(values.dateOfBirth);
    if (age === null) errors.dateOfBirth = "Enter a valid date.";
    else if (age < 21) errors.dateOfBirth = "You must be at least 21 years old to register.";
    else if (age > 100) errors.dateOfBirth = "Enter a valid date of birth.";
  }

  if (!values.specialty) errors.specialty = "Please select a specialty.";

  if (!values.qualification.trim()) errors.qualification = "Qualification is required.";
  else if (values.qualification.trim().length < 2) errors.qualification = "Enter a valid qualification.";

  if (!values.registrationNumber.trim()) {
    errors.registrationNumber = "Medical registration number is required.";
  } else if (values.registrationNumber.trim().length < 4) {
    errors.registrationNumber = "Enter a valid registration number.";
  }

  if (!values.experienceYears.trim()) {
    errors.experienceYears = "Years of experience is required.";
  } else {
    const years = Number(values.experienceYears);
    if (!Number.isFinite(years) || years < 0 || years > 60) {
      errors.experienceYears = "Enter a value between 0 and 60.";
    }
  }

  if (!values.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter a valid email address.";

  if (!values.phone.trim()) errors.phone = "Phone number is required.";
  else if (!PHONE_PATTERN.test(values.phone.trim())) errors.phone = "Enter a valid phone number.";

  if (!values.address.trim()) errors.address = "Practice address is required.";
  if (!values.city.trim()) errors.city = "City is required.";
  if (!values.state.trim()) errors.state = "State is required.";

  if (!values.postalCode.trim()) {
    errors.postalCode = "Postal / PIN code is required.";
  } else if (!POSTAL_PATTERN.test(values.postalCode.trim())) {
    errors.postalCode = "Enter a valid postal code.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (!PASSWORD_PATTERN.test(values.password)) {
    errors.password = "Password must be at least 8 characters and include a letter and a number.";
  }

  if (!values.confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords do not match.";

  return errors;
}

export function DoctorRegistrationForm() {
  const router = useRouter();
  const { submit, submitting, error: submitError } = useDoctorRegistration();

  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const result = await submit({
      fullName: values.fullName.trim(),
      gender: values.gender as Gender,
      dateOfBirth: values.dateOfBirth,
      specialty: values.specialty,
      qualification: values.qualification.trim(),
      registrationNumber: values.registrationNumber.trim(),
      experienceYears: Number(values.experienceYears),
      email: values.email.trim(),
      phone: values.phone.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      postalCode: values.postalCode.trim(),
      password: values.password,
    });

    if (result) {
      router.push("/doctor/login");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      <fieldset className="space-y-4">
        <legend className="text-base font-semibold tracking-tight">Personal details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="fullName"
            label="Full name"
            autoComplete="name"
            value={values.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            error={errors.fullName}
            placeholder="Dr. Jordan Lee"
          />
          <SelectField
            id="gender"
            label="Gender"
            value={values.gender}
            onChange={(value) => updateField("gender", value as Gender)}
            options={GENDER_OPTIONS}
            placeholder="Select gender"
            error={errors.gender}
          />
        </div>
        <FormField
          id="dateOfBirth"
          label="Date of birth"
          type="date"
          autoComplete="bday"
          value={values.dateOfBirth}
          onChange={(event) => updateField("dateOfBirth", event.target.value)}
          error={errors.dateOfBirth}
          className="sm:max-w-xs"
        />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-base font-semibold tracking-tight">Professional details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="specialty"
            label="Specialty"
            value={values.specialty}
            onChange={(value) => updateField("specialty", value)}
            options={SPECIALTIES}
            placeholder="Select specialty"
            error={errors.specialty}
          />
          <FormField
            id="qualification"
            label="Qualification"
            value={values.qualification}
            onChange={(event) => updateField("qualification", event.target.value)}
            error={errors.qualification}
            placeholder="MBBS, MD"
          />
          <FormField
            id="registrationNumber"
            label="Medical registration number"
            value={values.registrationNumber}
            onChange={(event) => updateField("registrationNumber", event.target.value)}
            error={errors.registrationNumber}
            placeholder="MCI-12345"
          />
          <FormField
            id="experienceYears"
            label="Years of experience"
            type="number"
            min={0}
            max={60}
            value={values.experienceYears}
            onChange={(event) => updateField("experienceYears", event.target.value)}
            error={errors.experienceYears}
            placeholder="8"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-base font-semibold tracking-tight">Contact details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            error={errors.email}
            placeholder="you@schedula.dev"
          />
          <FormField
            id="phone"
            label="Phone number"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            error={errors.phone}
            placeholder="+1 555-0100"
          />
        </div>
        <FormField
          id="address"
          label="Practice address"
          autoComplete="street-address"
          value={values.address}
          onChange={(event) => updateField("address", event.target.value)}
          error={errors.address}
          placeholder="221 Cedar Street"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            id="city"
            label="City"
            autoComplete="address-level2"
            value={values.city}
            onChange={(event) => updateField("city", event.target.value)}
            error={errors.city}
          />
          <FormField
            id="state"
            label="State"
            autoComplete="address-level1"
            value={values.state}
            onChange={(event) => updateField("state", event.target.value)}
            error={errors.state}
          />
          <FormField
            id="postalCode"
            label="Postal / PIN code"
            autoComplete="postal-code"
            value={values.postalCode}
            onChange={(event) => updateField("postalCode", event.target.value)}
            error={errors.postalCode}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-base font-semibold tracking-tight">Account details</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            error={errors.password}
            placeholder="••••••••"
          />
          <FormField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            error={errors.confirmPassword}
            placeholder="••••••••"
          />
        </div>
        <p className="text-xs text-[var(--muted)]">
          Use at least 8 characters, including a letter and a number.
        </p>
      </fieldset>

      {submitError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200"
        >
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Creating account…" : "Create doctor account"}
      </button>
    </form>
  );
}
