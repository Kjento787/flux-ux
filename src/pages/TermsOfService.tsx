import { FileText } from "lucide-react";
import { LegalPageLayout, LegalSection } from "@/components/LegalPageLayout";

const TermsOfService = () => {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="January 19, 2026" icon={FileText}>
      <LegalSection number="1" title="Acceptance of Terms">
        <p>
          By accessing or using Flux-UX ("the Service"), you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use our Service. We reserve the right to
          modify these terms at any time, and your continued use of the Service constitutes acceptance
          of any modifications.
        </p>
      </LegalSection>

      <LegalSection number="2" title="Description of Service">
        <p>
          Flux-UX provides a streaming platform that allows users to discover, browse, and watch
          movies and TV shows. The Service may include features such as user accounts, watchlists,
          reviews, and personalized recommendations. We do not host any content directly; we aggregate
          and provide access to content from third-party sources.
        </p>
      </LegalSection>

      <LegalSection number="3" title="User Accounts">
        <p>To access certain features of the Service, you may be required to create an account. You are responsible for:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Maintaining the confidentiality of your account credentials</li>
          <li>All activities that occur under your account</li>
          <li>Providing accurate and complete information during registration</li>
          <li>Notifying us immediately of any unauthorized use of your account</li>
        </ul>
      </LegalSection>

      <LegalSection number="4" title="Prohibited Conduct">
        <p>You agree not to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Use the Service for any unlawful purpose or in violation of any laws</li>
          <li>Attempt to gain unauthorized access to any part of the Service</li>
          <li>Interfere with or disrupt the Service or servers connected to the Service</li>
          <li>Use automated systems or software to extract data from the Service</li>
          <li>Upload, post, or transmit any harmful, threatening, or offensive content</li>
          <li>Impersonate any person or entity or misrepresent your affiliation</li>
          <li>Circumvent any measures we use to restrict access to the Service</li>
          <li>Share your account with others or create multiple accounts</li>
        </ul>
      </LegalSection>

      <LegalSection number="5" title="Content and Intellectual Property">
        <p>
          All content available through the Service, including but not limited to text, graphics,
          logos, images, and software, is the property of Bloxwave or its content suppliers and is
          protected by intellectual property laws. Movie and TV show metadata is provided by TMDB
          (The Movie Database). You may not reproduce, distribute, modify, or create derivative
          works from any content without prior written permission.
        </p>
      </LegalSection>

      <LegalSection number="6" title="User-Generated Content">
        <p>
          By submitting reviews, comments, or other content to the Service, you grant Bloxwave a
          non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display
          such content. You represent that you own or have the necessary rights to submit such
          content and that it does not violate any third-party rights.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Account Suspension and Termination">
        <p>
          We reserve the right to suspend or terminate your account and access to the Service at
          our sole discretion, without notice, for conduct that we believe violates these Terms
          or is harmful to other users, us, or third parties, or for any other reason. This includes
          IP-based restrictions when necessary to maintain the integrity of our Service.
        </p>
      </LegalSection>

      <LegalSection number="8" title="Disclaimer of Warranties">
        <p className="uppercase text-xs tracking-wide">
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
          EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
          ERROR-FREE, OR SECURE. WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF
          MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>
      </LegalSection>

      <LegalSection number="9" title="Limitation of Liability">
        <p className="uppercase text-xs tracking-wide">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, BLOXWAVE SHALL NOT BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
          REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL,
          OR OTHER INTANGIBLE LOSSES.
        </p>
      </LegalSection>

      <LegalSection number="10" title="Indemnification">
        <p>
          You agree to indemnify and hold harmless Bloxwave, its officers, directors, employees,
          and agents from any claims, damages, losses, liabilities, and expenses (including
          attorneys' fees) arising out of your use of the Service or violation of these Terms.
        </p>
      </LegalSection>

      <LegalSection number="11" title="Governing Law">
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the
          jurisdiction in which Bloxwave operates, without regard to its conflict of law provisions.
          Any disputes arising under these Terms shall be subject to the exclusive jurisdiction
          of the courts in that jurisdiction.
        </p>
      </LegalSection>

      <LegalSection number="12" title="Changes to Terms">
        <p>
          We reserve the right to modify these Terms at any time. We will notify users of any
          material changes by posting the updated Terms on the Service with a new "Last updated"
          date. Your continued use of the Service after such changes constitutes acceptance of
          the modified Terms.
        </p>
      </LegalSection>

      <LegalSection number="13" title="Contact Information">
        <p>
          If you have any questions about these Terms of Service, please contact us through the
          appropriate channels available on our platform.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default TermsOfService;
