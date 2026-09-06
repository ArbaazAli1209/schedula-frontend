export type TestReport = {
  id: string;
  patientEmail: string;
  name: string;
  issuedAt: string;
};

/** Demo-only lab/test report records, keyed by patient email. */
export const testReports: TestReport[] = [
  { id: "rep-1", patientEmail: "maya@schedula.dev", name: "Complete blood count", issuedAt: "2026-08-16T09:00:00.000Z" },
  { id: "rep-2", patientEmail: "maya@schedula.dev", name: "Chest X-ray", issuedAt: "2026-08-16T09:15:00.000Z" },
];
