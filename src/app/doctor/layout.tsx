import { DoctorAuthProvider } from "@/features/doctor-portal/hooks/useDoctorAuth";
import { DoctorNavBar } from "@/features/doctor-portal/components/DoctorNavBar";
import { DoctorChatWidget } from "@/features/chat/components/DoctorChatWidget";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DoctorAuthProvider>
      <DoctorNavBar />
      {children}
      <DoctorChatWidget />
    </DoctorAuthProvider>
  );
}
