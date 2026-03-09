import { LegalPageLayout } from "@/components/LegalPageLayout";
import { Shield } from "lucide-react";

const DMCA = () => {
  return (
    <LegalPageLayout title="DMCA Policy" lastUpdated="March 2026" icon={Shield}>
      <p>We respect the intellectual property rights of others and expect our users to do the same.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Reporting Copyright Infringement</h2>
      <p>If you believe your copyrighted work has been used in a way that constitutes infringement, please contact us with the relevant details.</p>
    </LegalPageLayout>
  );
};

export default DMCA;
