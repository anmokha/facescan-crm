export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-slate-500 mb-8">Last updated: January 11, 2026</p>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              CureScan ("we", "our", or "us") operates an AI-powered skin analysis platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
            </p>
            <p className="text-slate-700 leading-relaxed">
              By using CureScan, you agree to the collection and use of information in accordance with this policy. This policy is compliant with UAE Personal Data Protection Law (PDPL) and GDPR standards.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">2.1 Personal Data</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              When you use our service, we may collect the following personal information:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li><strong>Contact Information:</strong> Phone number, email address (optional)</li>
              <li><strong>Consent Records:</strong> WhatsApp opt-in consent, timestamp, IP address, user agent</li>
              <li><strong>Usage Data:</strong> Interaction timestamps, clicked buttons, selected procedures</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-800 mb-3 mt-6">2.2 Photo Data</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              When you upload photos for skin analysis:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2">
              <li>Photos are processed by AI to generate skin analysis results</li>
              <li>Photos are stored securely for 30 days for quality assurance</li>
              <li>Photos are NOT shared with third parties except the clinic you selected</li>
              <li>You can request deletion at any time by contacting support</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2">
              <li><strong>Service Delivery:</strong> Provide AI skin analysis and personalized recommendations</li>
              <li><strong>Communication:</strong> Contact you via WhatsApp (only if you opted in) or phone regarding your results and clinic booking</li>
              <li><strong>Clinic Matching:</strong> Share your analysis results and contact information with the selected clinic</li>
              <li><strong>Legal Compliance:</strong> Maintain consent records for PDPL and data protection compliance</li>
              <li><strong>Service Improvement:</strong> Analyze usage patterns to improve AI accuracy and user experience</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. WhatsApp Communication & Consent</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We ONLY contact you on WhatsApp if you explicitly opt-in by checking the consent checkbox. Your consent includes:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>Receiving your analysis results and summary</li>
              <li>Booking confirmation and available appointment slots</li>
              <li>Follow-up messages related to your inquiry</li>
            </ul>
            <p className="text-slate-700 leading-relaxed">
              <strong>You can opt-out anytime</strong> by replying "STOP" or blocking the clinic's WhatsApp number. We log all consent records including timestamp, IP address, and consent text for compliance purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Sharing & Disclosure</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We share your information in the following scenarios:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2">
              <li><strong>Selected Clinic:</strong> Your analysis results, contact information, and consent status are shared with the clinic you choose</li>
              <li><strong>AI Service Providers:</strong> Photos are processed by Google Gemini AI (server-side only, not stored by Google)</li>
              <li><strong>Legal Requirements:</strong> We may disclose information if required by UAE law or valid legal process</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4">
              <strong>We do NOT:</strong> Sell your data, share with advertisers, or use for purposes other than stated in this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Data Storage & Security</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We implement industry-standard security measures:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2">
              <li><strong>Encryption:</strong> All data transmitted is encrypted using TLS/SSL</li>
              <li><strong>Cloud Storage:</strong> Data stored on Firebase (Google Cloud) with enterprise-grade security</li>
              <li><strong>Access Control:</strong> Only authorized clinic staff can access your lead information</li>
              <li><strong>Retention:</strong> Photos stored for 30 days; contact data retained until you request deletion</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Your Rights (UAE PDPL Compliance)</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              Under UAE Personal Data Protection Law, you have the right to:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data we hold</li>
              <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
              <li><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Opt-Out:</strong> Withdraw consent for WhatsApp communication at any time</li>
              <li><strong>Data Portability:</strong> Request your data in a machine-readable format</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mt-4">
              To exercise these rights, contact us at: <a href="mailto:privacy@curescan.pro" className="text-blue-600 underline">privacy@curescan.pro</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Children's Privacy</h2>
            <p className="text-slate-700 leading-relaxed">
              Our service is not intended for users under 18 years of age. We do not knowingly collect data from minors. If you believe we have collected information from a minor, contact us immediately for deletion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. International Data Transfers</h2>
            <p className="text-slate-700 leading-relaxed">
              Your data may be processed in servers located outside the UAE (Google Cloud global infrastructure). We ensure adequate data protection safeguards through:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mt-4">
              <li>Google Cloud's ISO 27001, SOC 2, and GDPR compliance certifications</li>
              <li>Standard Contractual Clauses (SCCs) for international transfers</li>
              <li>Encryption in transit and at rest</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-slate-700 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of our service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">11. Contact Us</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              For questions, concerns, or to exercise your rights, contact us:
            </p>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <p className="text-slate-700"><strong>Email:</strong> <a href="mailto:privacy@curescan.pro" className="text-blue-600 underline">privacy@curescan.pro</a></p>
              <p className="text-slate-700 mt-2"><strong>Data Protection Officer:</strong> Available upon request</p>
              <p className="text-slate-700 mt-2"><strong>Response Time:</strong> We aim to respond within 7 business days</p>
            </div>
          </section>

          <section className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 italic">
              This Privacy Policy is compliant with UAE Personal Data Protection Law (Federal Decree-Law No. 45 of 2021) and follows GDPR best practices for transparency and user rights.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
