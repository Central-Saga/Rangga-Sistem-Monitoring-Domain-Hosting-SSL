import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar | Monitoring Infra",
  description: "Buat akun baru untuk sistem monitoring domain, hosting, dan SSL.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
