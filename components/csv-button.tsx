import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CSVButtonProps {
	text: string;
	onClick?: () => void;
	className?: string;
	disabled?: boolean;
}

export const CSVButton = ({ text, onClick, className, disabled }: CSVButtonProps) => {
	return (
		<Button 
			onClick={onClick} 
			className={className}
			variant="outline"
			disabled={disabled}
		>
			<Download className="h-4 w-4" />
			{text}
		</Button>
	);
};
