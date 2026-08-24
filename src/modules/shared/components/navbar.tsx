import type { ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
}

export interface NavbarProps {
  brand?: string;
  items?: NavItem[];
  rightContent?: ReactNode;
}

const Navbar = ({
  brand = "AgriConnect",
  items = [],
  rightContent,
}: NavbarProps) => {

  return (
    <nav className="shared-navbar">

      <a
        href="/"
        className="shared-navbar-brand"
      >
        {brand}
      </a>

      <div className="shared-navbar-links">

        {items.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="shared-navbar-link"
          >
            {item.label}
          </a>
        ))}

      </div>

      {rightContent && (
        <div>
          {rightContent}
        </div>
      )}

    </nav>
  );
};

export default Navbar;