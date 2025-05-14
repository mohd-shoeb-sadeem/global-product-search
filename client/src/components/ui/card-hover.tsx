import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { forwardRef } from "react";

interface CardHoverProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  onClick?: () => void;
}

const CardHover = forwardRef<HTMLDivElement, CardHoverProps>(
  ({ className, children, header, footer, onClick, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {header && <CardHeader className="p-0">{header}</CardHeader>}
        <CardContent className={cn("p-4", !header && "pt-4")}>{children}</CardContent>
        {footer && <CardFooter className="p-4 pt-0">{footer}</CardFooter>}
      </Card>
    );
  }
);

CardHover.displayName = "CardHover";

export { CardHover };
