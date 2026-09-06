/**
 * Builds a small, dependency-free PDF (raw PDF syntax, one page of text)
 * so "Download Prescription PDF" works without pulling in a PDF library.
 * Swap this for a real renderer (e.g. pdf-lib) once a backend/prescription
 * service exists — callers only depend on the returned Blob.
 */
import type { Appointment } from "@/types/appointment";
import type { Prescription } from "@/types/prescription";

function escapePdfText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function buildPrescriptionPdf(appointment: Appointment, prescription: Prescription): Blob {
  const issued = new Date(prescription.issuedAt).toLocaleString();
  const lines: string[] = [
    "Schedula Clinic — Prescription",
    "",
    `Patient: ${appointment.patient.name} (${appointment.patient.age} yrs)`,
    `Clinician: ${appointment.clinician}`,
    `Issued: ${issued}`,
    "",
    `Diagnosis: ${prescription.diagnosis || "—"}`,
    "",
    "Medications:",
    ...prescription.medications.map(
      (med) => `- ${med.name} ${med.dosage}${med.duration ? ` for ${med.duration}` : ""} — ${med.instructions}`,
    ),
    "",
    "Notes:",
    prescription.notes || "—",
  ];

  const fontSize = 12;
  const leading = 16;
  let contentStream = `BT /F1 ${fontSize} Tf 50 780 Td\n`;
  lines.forEach((line, index) => {
    if (index > 0) contentStream += `0 -${leading} Td\n`;
    contentStream += `(${escapePdfText(line)}) Tj\n`;
  });
  contentStream += "ET";

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}
