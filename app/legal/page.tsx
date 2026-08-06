import { permanentRedirect } from "next/navigation";
import { legalSectionPath } from "@/lib/navigation";

export default function LegalIndexPage() {
  permanentRedirect(legalSectionPath("privacy"));
}
