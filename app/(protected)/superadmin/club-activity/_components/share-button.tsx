"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useShare } from "../[id]/hooks/use-share";

interface ShareButtonProps {
	id: string;
	dir: string;
}

export const ShareButton = ({ id, dir }: ShareButtonProps) => {
	const { handleCopy, copied } = useShare({ id, dir });

	return (
		<Button onClick={handleCopy}>
			<Share2 className="w-4 h-4" />
			{copied ? "コピー済み" : "共有リンク"}
		</Button>
	);
};
