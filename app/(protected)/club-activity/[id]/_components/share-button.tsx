"use client";

import { CopyIcon } from "lucide-react";
import { useShare } from "../hooks/use-share";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  id: string;
  dir: string;
}

export const ShareButton = ({ id, dir }: ShareButtonProps) => {
  const { handleCopy, copied } = useShare({ id, dir });

  return (
    <Button onClick={handleCopy}>
      <CopyIcon className="w-4 h-4" />
      {copied ? "コピー済み" : "共有リンクをコピー"}
    </Button>
  );
};
