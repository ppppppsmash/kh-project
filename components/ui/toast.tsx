"use client";

import { Toaster, toast as sonnerToast } from "sonner";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface ToastProps {
  position?: "top-center" | "top-right" | "top-left" | "bottom-center" | "bottom-right" | "bottom-left";
  duration?: number;
  richColors?: boolean;
  closeButton?: boolean;
  className?: string;
}

const toastIcons = {
  success: <CheckCircle2 className="h-4 w-4" />,
  error: <AlertCircle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
};

export const Toast = ({ ...props }: ToastProps) => {
  return <Toaster {...props} />;
};

export const CustomToast = {
  success: (message: string) => {
    sonnerToast.success(message, {
      icon: toastIcons.success,
    });
  },
  error: (message: string) => {
    sonnerToast.error(message, {
      icon: toastIcons.error,
    });
  },
  info: (message: string) => {
    sonnerToast.info(message, {
      icon: toastIcons.info,
    });
  },
  warning: (message: string) => {
    sonnerToast.warning(message, {
      icon: toastIcons.warning,
    });
  },
};
