export type PrescriptionMedication = {
  name: string;
  dosage: string;
  instructions: string;
};

export type Prescription = {
  id: string;
  appointmentId: string;
  issuedAt: string;
  notes: string;
  medications: PrescriptionMedication[];
};
