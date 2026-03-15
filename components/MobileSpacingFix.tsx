export function MobileSpacingFix() {
  return (
    <style>{`
      /* Prevent horizontal scroll sitewide */
      html, body {
        overflow-x: hidden;
      }
      @media (max-width: 639px) {
        /* Reduce section padding on mobile */
        section[data-slot="section"] {
          padding-top: 2rem !important;
          padding-bottom: 2rem !important;
        }
        /* Also reduce custom sections without data-slot */
        .page-prose > section {
          padding-top: 2rem !important;
          padding-bottom: 2rem !important;
        }
        /* Reduce heading margins in sections */
        section h2 {
          margin-bottom: 1.5rem !important;
        }
        section .mb-12 {
          margin-bottom: 1.5rem !important;
        }
        section .mb-10 {
          margin-bottom: 1.5rem !important;
        }
      }
    `}</style>
  );
}
