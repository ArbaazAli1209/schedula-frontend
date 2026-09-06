import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function FormField({ label, error, id, className, ...props }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-[var(--ink)]">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1.5 w-full rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)] ${className ?? ""}`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

type SelectOption = string | { value: string; label: string };

type SelectFieldProps = {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
};

export function SelectField({
  label,
  id,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-[var(--ink)]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1.5 w-full rounded-lg border border-[var(--line)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
      >
        <option value="" disabled>
          {placeholder ?? "Select…"}
        </option>
        {options.map((option) =>
          typeof option === "string" ? (
            <option key={option} value={option}>
              {option}
            </option>
          ) : (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ),
        )}
      </select>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
