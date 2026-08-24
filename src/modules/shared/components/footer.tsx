import type { ReactNode } from "react";

export interface FooterProps {
  children?: ReactNode;
}

const Footer = ({
  children,
}: FooterProps) => {

  return (
    <footer className="shared-footer">

      <div>
        <strong>AgriConnect</strong>

        <p>
          Certified fertilizer marketplace
          and farmer advisory platform.
        </p>
      </div>

      <div>

        {children}

        <p>
          © 2026 AgriConnect
        </p>

      </div>

    </footer>
  );
};

export default Footer;