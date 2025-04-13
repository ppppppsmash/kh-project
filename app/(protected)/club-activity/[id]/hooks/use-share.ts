import { useState } from "react";
import { CustomToast } from "@/components/ui/toast";

interface useShareProps {
  id: string;
  dir: string;
}

export const useShare = ({ id, dir }: useShareProps) => {
  const [copied, setCopied] = useState(false);
  const publicUrl = `${process.env.NEXT_PUBLIC_SHARE_URL}/${dir}/${id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    CustomToast.success("URLをコピーしました");
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    publicUrl,
    copied,
    handleCopy,
  };
};
