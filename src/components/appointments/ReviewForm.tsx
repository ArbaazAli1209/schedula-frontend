"use client";

import { useState, type FormEvent } from "react";
import type { Appointment } from "@/types/appointment";
import type { Review } from "@/types/review";
import { submitReview } from "@/features/appointments/api/appointmentsClient";
import { Modal } from "@/components/ui/Modal";

type Props = {
  appointment: Appointment;
  onClose: () => void;
  onSubmitted: (review: Review) => void;
};

export function ReviewForm({ appointment, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const review = await submitReview(appointment.id, { rating, comment: comment.trim() });
      onSubmitted(review);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit your review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={`Review ${appointment.clinician}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm font-medium text-[var(--ink)]">Rating</p>
          <div className="mt-1.5 flex gap-1" role="radiogroup" aria-label="Rating out of 5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                onClick={() => setRating(value)}
                className={`grid size-9 place-items-center rounded-lg border text-lg ${
                  value <= rating
                    ? "border-amber-300 bg-amber-50 text-amber-500"
                    : "border-[var(--line)] text-stone-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="review-comment" className="text-sm font-medium text-[var(--ink)]">
            Comments (optional)
          </label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            className="mt-1.5 w-full rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--brand)]"
            placeholder="How did the visit go?"
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-semibold hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-deep)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
