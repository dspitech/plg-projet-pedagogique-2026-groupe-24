import { Toaster as Sonner } from "sonner";
import { AlertTriangle, CircleCheck, CircleX, Info } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const toastBase =
  "group toast !relative !flex !flex-col !items-center !justify-center !gap-2 !w-full !min-w-[min(100%,22rem)] !max-w-md !rounded-2xl !border !px-7 !py-6 !shadow-[0_25px_80px_-15px_rgba(0,0,0,0.7)] !backdrop-blur-2xl !transition-all !duration-300 !text-center !font-sans";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      expand={false}
      closeButton
      richColors={false}
      offset={0}
      gap={14}
      visibleToasts={3}
      duration={4500}
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-5 w-5 shrink-0 text-success" strokeWidth={2} />,
        error: <CircleX className="h-5 w-5 shrink-0 text-destructive" strokeWidth={2} />,
        info: <Info className="h-5 w-5 shrink-0 text-info" strokeWidth={2} />,
        warning: <AlertTriangle className="h-5 w-5 shrink-0 text-warning" strokeWidth={2} />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: `${toastBase} !bg-card/95 !border-border/60 !text-foreground`,
          title: "!text-sm !font-semibold !text-foreground !text-center !leading-snug",
          description: "!text-xs !text-muted-foreground !text-center !mt-0.5",
          content: "!flex !flex-col !items-center !justify-center !text-center !gap-0.5",
          icon: "!m-0",
          closeButton:
            "!absolute !right-2 !top-2 !left-auto !transform-none !border-border/50 !bg-secondary/80 !text-muted-foreground hover:!text-foreground hover:!bg-secondary !transition-colors",
          success: `${toastBase} !border-success/40 !bg-gradient-to-br !from-card !via-card !to-success/10`,
          error: `${toastBase} !border-destructive/40 !bg-gradient-to-br !from-card !via-card !to-destructive/10`,
          warning: `${toastBase} !border-warning/40 !bg-gradient-to-br !from-card !via-card !to-warning/10`,
          info: `${toastBase} !border-info/40 !bg-gradient-to-br !from-card !via-card !to-info/10`,
          actionButton:
            "!rounded-lg !bg-primary !text-primary-foreground !text-xs !font-medium !px-3 !py-1.5",
          cancelButton:
            "!rounded-lg !bg-secondary !text-secondary-foreground !text-xs !font-medium !px-3 !py-1.5",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
