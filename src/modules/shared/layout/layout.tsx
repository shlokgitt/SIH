import type { ReactNode } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export interface LayoutProps {
  children: ReactNode;

  navItems?: {
    label: string;
    href: string;
  }[];

  footerContent?: ReactNode;
}

const Layout = ({
  children,
  navItems = [],
  footerContent,
}: LayoutProps) => {

  return (
    <div className="shared-layout">

      <Navbar
        items={navItems}
      />

      <main>
        {children}
      </main>

      <Footer>
        {footerContent}
      </Footer>

    </div>
  );
};

export default Layout;