import { DoctorAuthProvider } from "@/features/doctor-portal/hooks/useDoctorAuth";
import { DoctorNavBar } from "@/features/doctor-portal/components/DoctorNavBar";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DoctorAuthProvider>
      <DoctorNavBar />
      {children}
    </DoctorAuthProvider>
  );
}
