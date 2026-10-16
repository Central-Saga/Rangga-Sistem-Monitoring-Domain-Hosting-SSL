import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Masuk | Monitoring Infra",
  description: "Masuk ke sistem monitoring domain, hosting, dan SSL.",
};

export default function LoginPage() {
  return <LoginForm />;
}
