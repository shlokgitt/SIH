import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) => {

  return (
    <button
      className={`shared-button shared-button-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;