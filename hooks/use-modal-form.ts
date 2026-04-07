import { useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export const useModalFormSubmit = <T extends FieldValues>(
	form: UseFormReturn<T>,
	onSubmit: (data: T) => Promise<void>,
	onClose: () => void,
) => {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (data: T) => {
		setIsSubmitting(true);
		try {
			await onSubmit(data);
			form.reset();
			onClose();
		} catch (error) {
			console.error("送信に失敗しました:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return { isSubmitting, handleSubmit };
};
