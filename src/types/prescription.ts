export type PrescriptionMedication = {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
};

export type Prescription = {
  id: string;
  appointmentId: string;
  issuedAt: string;
  diagnosis: string;
  notes: string;
  medications: PrescriptionMedication[];
};
