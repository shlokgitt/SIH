import type { ReactNode } from "react";

export interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

const Card = ({
  children,
  title,
  className = "",
}: CardProps) => {

  return (
    <div className={`shared-card ${className}`}>

      {title && (
        <h3 className="shared-card-title">
          {title}
        </h3>
      )}

      {children}

    </div>
  );
};

export default Card;