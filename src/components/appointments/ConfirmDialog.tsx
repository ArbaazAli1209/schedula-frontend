"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";

type Props = {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
};

/** Reusable confirmation dialog for destructive actions (Cancel / Decline). */
export function ConfirmDialog({ title, description, confirmLabel, destructive = true, onConfirm, onClose }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-[var(--muted)]">{description}</p>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
        >
          Never mind
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={handleConfirm}
          className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
            destructive ? "bg-red-600 hover:bg-red-700" : "bg-[var(--brand)] hover:bg-[var(--brand-deep)]"
          }`}
        >
          {submitting ? "Working…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
