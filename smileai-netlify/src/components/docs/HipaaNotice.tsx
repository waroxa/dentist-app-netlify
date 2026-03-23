import React, { useEffect } from 'react';

export function PrivacyNotice() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Privacy Notice - SmileVisionPro AI';
  }, []);

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      lineHeight: 1.8,
      color: '#333',
      maxWidth: '900px',
      margin: '0 auto',
      padding: '40px 20px',
      background: '#f9fafb',
      minHeight: '100vh'
    }}>
      <div style={{
        background: 'white',
        padding: '60px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#0EA5E9', marginBottom: '10px' }}>Privacy Notice</h1>
        <p style={{ color: '#64748b', fontStyle: 'italic' }}>Effective Date: March 22, 2026</p>
        <p style={{ color: '#64748b', fontStyle: 'italic' }}>Last Updated: March 22, 2026</p>

        <Section title="1. Why This Notice Exists">
          <p>
            SmileVisionPro AI may process patient contact information, smile photographs, AI-generated preview images, and related workflow data. This page explains the current privacy and security posture of the application and is intended to help clinics understand how privacy-sensitive information is handled.
          </p>
        </Section>

        <Section title="2. Current Security Measures in the Application">
          <p>The current codebase includes several safeguards that support a privacy-conscious deployment:</p>
          <ul>
            <li>Administrator access uses a server-side login endpoint and an HTTP-only, Secure, SameSite=Lax session cookie.</li>
            <li>CRM OAuth tokens are stored server-side in encrypted form rather than exposed directly in the browser.</li>
            <li>Lead submissions are sent to backend functions instead of writing directly to Supabase from the public page.</li>
            <li>Audit logging exists for important backend events such as admin logins, lead creation, and CRM connection activity.</li>
            <li>Application traffic is intended to run over HTTPS through the deployment platform.</li>
          </ul>
        </Section>

        <Section title="3. Important Limitation: This Is Not a HIPAA Compliance Certification">
          <p>
            Based on the current implementation, SmileVisionPro AI should not be described as fully HIPAA compliant at this time.
          </p>
          <p>The main reasons are:</p>
          <ul>
            <li>Uploaded smile images and generated assets are turned into publicly accessible storage URLs in the current backend flow.</li>
            <li>Raw image data URLs and generated image data are stored in database records, which increases sensitivity and retention risk.</li>
            <li>The database migration shown in this codebase does not establish HIPAA-specific access controls such as row-level security policies for PHI tables.</li>
            <li>HIPAA compliance also depends on operational controls outside the code, including minimum-necessary access, workforce policies, breach response, retention rules, and documented administrative safeguards.</li>
            <li>Business Associate Agreements may be required with hosting, database, storage, and AI vendors before PHI can be handled in a compliant production workflow.</li>
          </ul>
        </Section>

        <Section title="4. What Must Be Completed Before Claiming HIPAA Compliance">
          <ul>
            <li>Move all patient images and generated media to private storage with signed, time-limited access instead of public URLs.</li>
            <li>Stop storing raw image data URLs in application tables unless there is a documented need and an approved retention policy.</li>
            <li>Implement and verify database access controls, least-privilege permissions, and monitoring around PHI-bearing tables.</li>
            <li>Confirm that every vendor involved in storing or processing PHI offers the required contractual and security support for HIPAA workflows.</li>
            <li>Adopt clinic-level administrative, technical, and physical safeguards and have compliance counsel review the final deployment.</li>
          </ul>
        </Section>

        <Section title="5. Practical Summary">
          <p>
            SmileVisionPro AI includes several security-oriented features, but security features alone do not equal HIPAA compliance. Until the storage model, access controls, vendor agreements, and operational safeguards are fully completed and validated, this application should be described as privacy-focused or security-conscious rather than fully HIPAA compliant.
          </p>
        </Section>

        <Section title="6. Contact">
          <p>
            If you need deployment-specific privacy or security information, contact <a href="mailto:support@smilevisionpro.ai" style={{ color: '#0EA5E9', textDecoration: 'none' }}>support@smilevisionpro.ai</a>.
          </p>
        </Section>

        <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9em' }}>
          © 2026 SmileVisionPro AI - All Rights Reserved<br />
          <a href="/" style={{ color: '#0EA5E9', textDecoration: 'none' }}>Back to App</a>
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 style={{
        color: '#1e293b',
        marginTop: '40px',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        {title}
      </h2>
      {children}
    </>
  );
}
