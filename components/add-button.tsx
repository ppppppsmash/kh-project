import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface AddButtonProps {
	text: string;
	onClick?: () => void;
	className?: string;
}

export const AddButton = ({ text, onClick, className }: AddButtonProps) => {
	return (
		<Button onClick={onClick} className={className}>
			<PlusCircle className="h-4 w-4" />
			{text}
		</Button>
	);
};
