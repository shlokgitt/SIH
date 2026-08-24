import type {
  InputHTMLAttributes,
} from "react";

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = ({
  label,
  id,
  className = "",
  ...props
}: InputProps) => {

  return (
    <div className="shared-input-container">

      <label
        htmlFor={id}
        className="shared-input-label"
      >
        {label}
      </label>

      <input
        id={id}
        className={`shared-input ${className}`}
        {...props}
      />

    </div>
  );
};

export default Input;