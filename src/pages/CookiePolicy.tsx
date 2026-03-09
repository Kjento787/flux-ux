import { LegalPageLayout } from "@/components/LegalPageLayout";

const CookiePolicy = () => {
  return (
    <LegalPageLayout title="Cookie Policy">
      <p>This Cookie Policy explains how we use cookies and similar technologies.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">What Are Cookies</h2>
      <p>Cookies are small text files stored on your device when you visit our website.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">How We Use Cookies</h2>
      <p>We use cookies to improve your experience, analyze traffic, and personalize content.</p>
    </LegalPageLayout>
  );
};

export default CookiePolicy;
