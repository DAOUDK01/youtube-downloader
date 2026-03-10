export default function Policies() {
  return (
    <div className="page-content">
      <section className="page-header">
        <h1>Privacy Policy & Terms of Service</h1>
        <p className="page-header-subtitle">Last updated: March 3, 2026</p>
      </section>

      <div className="policy-container">
        {/* Privacy Policy */}
        <div className="policy-section">
          <h2>Privacy Policy</h2>

          <div className="policy-block">
            <h3>1. Information We Collect</h3>
            <p>
              We collect minimal information necessary to provide our YouTube to
              MP3 conversion service. This includes:
            </p>
            <ul>
              <li>
                <strong>YouTube URLs:</strong> The video URLs you submit for
                conversion. These are used solely for processing your request
                and are not stored permanently.
              </li>
              <li>
                <strong>Usage Data:</strong> Basic analytics such as page views
                and conversion counts to help us improve the service.
              </li>
              <li>
                <strong>Device Information:</strong> Browser type and operating
                system for compatibility and troubleshooting purposes.
              </li>
            </ul>
          </div>

          <div className="policy-block">
            <h3>2. How We Use Your Information</h3>
            <p>We use the collected information to:</p>
            <ul>
              <li>Process your video-to-audio conversion requests</li>
              <li>Improve and optimize our service performance</li>
              <li>Monitor and prevent abuse of our platform</li>
              <li>Provide technical support when needed</li>
            </ul>
          </div>

          <div className="policy-block">
            <h3>3. Data Retention</h3>
            <p>
              Converted files are temporarily stored on our servers and
              automatically deleted within <strong>1 hour</strong> after
              conversion. We do not keep permanent copies of any converted
              files. Server logs are retained for up to 30 days for security and
              troubleshooting purposes.
            </p>
          </div>

          <div className="policy-block">
            <h3>4. Cookies</h3>
            <p>
              We may use essential cookies to ensure the proper functioning of
              the website. We do not use tracking cookies or third-party
              advertising cookies. You can disable cookies through your browser
              settings at any time.
            </p>
          </div>

          <div className="policy-block">
            <h3>5. Third-Party Services</h3>
            <p>
              We do not sell, trade, or share your personal information with
              third parties. Our service interacts with YouTube solely to
              retrieve video data for conversion.
            </p>
          </div>
        </div>

        {/* Terms of Service */}
        <div className="policy-section">
          <h2>Terms of Service</h2>

          <div className="policy-block">
            <h3>1. Acceptance of Terms</h3>
            <p>
              By accessing and using this website, you accept and agree to be
              bound by these Terms of Service. If you do not agree with any part
              of these terms, please do not use our service.
            </p>
          </div>

          <div className="policy-block">
            <h3>2. Permitted Use</h3>
            <p>
              This service is provided for personal, non-commercial use only.
              You agree to use this service only for lawful purposes and in
              compliance with all applicable laws and regulations. You are
              responsible for ensuring you have the right to download and
              convert any content.
            </p>
          </div>

          <div className="policy-block">
            <h3>3. Copyright & Intellectual Property</h3>
            <p>
              Users are solely responsible for ensuring that they have the
              necessary rights or permissions to download and convert any
              content. We do not host or store copyrighted material beyond the
              temporary conversion process. We respect intellectual property
              rights and expect our users to do the same.
            </p>
          </div>

          <div className="policy-block">
            <h3>4. Limitation of Liability</h3>
            <p>
              This service is provided "as is" without warranties of any kind,
              either express or implied. We shall not be held liable for any
              damages arising from the use or inability to use this service,
              including but not limited to direct, indirect, incidental, or
              consequential damages.
            </p>
          </div>

          <div className="policy-block">
            <h3>5. Service Availability</h3>
            <p>
              We strive to maintain high availability but do not guarantee
              uninterrupted access to our service. We reserve the right to
              modify, suspend, or discontinue the service at any time without
              prior notice.
            </p>
          </div>

          <div className="policy-block">
            <h3>6. Changes to Terms</h3>
            <p>
              We reserve the right to update these terms at any time. Continued
              use of the service after changes constitutes acceptance of the
              revised terms. We encourage users to review this page
              periodically.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="policy-section">
          <h2>Disclaimer</h2>
          <div className="policy-block">
            <p>
              This tool is intended for converting content that is either owned
              by the user or is freely available under a permissive license. We
              do not encourage or condone the downloading of copyrighted
              material without permission. Users assume all responsibility for
              their use of this service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
