import { Shield } from "lucide-react";
import { LegalPageLayout, LegalSection } from "@/components/LegalPageLayout";

const PrivacyPolicy = () => {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="January 19, 2026" icon={Shield}>
      <LegalSection number="1" title="Introduction">
        <p>
          Flux-UX ("we," "our," or "us") is committed to protecting your privacy. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your information when you
          use our streaming service. Please read this policy carefully to understand our practices
          regarding your personal data.
        </p>
      </LegalSection>

      <LegalSection number="2" title="Information We Collect">
        <p className="font-semibold text-foreground">2.1 Information You Provide</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Account information (email address, display name, password)</li>
          <li>Profile information (avatar, preferences)</li>
          <li>Reviews and ratings you submit</li>
          <li>Content added to your watchlist</li>
          <li>Communications with us (support requests, feedback)</li>
        </ul>

        <p className="font-semibold text-foreground mt-4">2.2 Automatically Collected Information</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Device information (browser type, operating system, device identifiers)</li>
          <li>IP address and approximate location</li>
          <li>Usage data (pages visited, features used, viewing history)</li>
          <li>Cookies and similar tracking technologies</li>
          <li>Log data (access times, error reports)</li>
        </ul>

        <p className="font-semibold text-foreground mt-4">2.3 Third-Party Information</p>
        <p>
          We may receive information about you from third-party services if you choose to link
          your account or sign in using social login providers.
        </p>
      </LegalSection>

      <LegalSection number="3" title="How We Use Your Information">
        <p>We use the collected information for the following purposes:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>To provide, maintain, and improve our Service</li>
          <li>To personalize your experience and provide content recommendations</li>
          <li>To process your account registration and maintain your profile</li>
          <li>To communicate with you about updates, features, and support</li>
          <li>To monitor and analyze usage patterns and trends</li>
          <li>To detect, prevent, and address technical issues and fraud</li>
          <li>To enforce our Terms of Service and protect user safety</li>
          <li>To comply with legal obligations</li>
        </ul>
      </LegalSection>

      <LegalSection number="4" title="Information Sharing">
        <p>We may share your information in the following circumstances:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong className="text-foreground">Service Providers:</strong> With third-party vendors who assist in operating our Service</li>
          <li><strong className="text-foreground">Legal Requirements:</strong> When required by law or to respond to legal process</li>
          <li><strong className="text-foreground">Safety:</strong> To protect the rights, safety, and property of users and others</li>
          <li><strong className="text-foreground">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          <li><strong className="text-foreground">With Your Consent:</strong> When you explicitly agree to share information</li>
        </ul>
        <p className="mt-4">We do not sell your personal information to third parties for marketing purposes.</p>
      </LegalSection>

      <LegalSection number="5" title="Data Security">
        <p>
          We implement appropriate technical and organizational security measures to protect your
          personal information against unauthorized access, alteration, disclosure, or destruction.
          These measures include encryption, secure servers, and access controls. However, no method
          of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection number="6" title="Data Retention">
        <p>
          We retain your personal information for as long as your account is active or as needed
          to provide you with our Service. We may also retain and use your information to comply
          with legal obligations, resolve disputes, and enforce our agreements.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Your Rights and Choices">
        <p>Depending on your location, you may have certain rights regarding your personal information:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li><strong className="text-foreground">Access:</strong> Request a copy of your personal data</li>
          <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate information</li>
          <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal data</li>
          <li><strong className="text-foreground">Portability:</strong> Request transfer of your data to another service</li>
          <li><strong className="text-foreground">Objection:</strong> Object to certain processing of your data</li>
          <li><strong className="text-foreground">Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
        </ul>
      </LegalSection>

      <LegalSection number="8" title="Children's Privacy">
        <p>
          Our Service is not intended for children under the age of 13. We do not knowingly
          collect personal information from children under 13.
        </p>
      </LegalSection>

      <LegalSection number="9" title="International Data Transfers">
        <p>
          Your information may be transferred to and processed in countries other than your
          country of residence. When we transfer your data, we take appropriate safeguards to
          ensure your information remains protected.
        </p>
      </LegalSection>

      <LegalSection number="10" title="Third-Party Links">
        <p>
          Our Service may contain links to third-party websites or services. We are not
          responsible for the privacy practices of these third parties.
        </p>
      </LegalSection>

      <LegalSection number="11" title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any
          material changes by posting the new Privacy Policy on this page with an updated
          "Last updated" date.
        </p>
      </LegalSection>

      <LegalSection number="12" title="Contact Us">
        <p>
          If you have any questions about this Privacy Policy or our data practices, please
          contact us through the appropriate channels available on our platform.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default PrivacyPolicy;
