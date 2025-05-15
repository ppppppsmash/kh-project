import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface EditButtonProps {
	text: string;
	onClick?: () => void;
}

export const EditButton = ({ text, onClick }: EditButtonProps) => {
	return (
		<Button onClick={onClick}>
			<Pencil className="h-4 w-4" />
			{text}
		</Button>
	);
};
