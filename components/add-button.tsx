import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface AddButtonProps {
  text: string;
  onClick?: () => void;
}

export const AddButton = ({ text, onClick }: AddButtonProps) => {
  return (
    <Button onClick={onClick}>
      <PlusCircle className="h-4 w-4" />
      {text}
    </Button>
  );
};
