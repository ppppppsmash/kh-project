"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
interface BaseModalFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => Promise<void>;
	title: string;
	children: ReactNode;
	isSubmitting?: boolean;
	submitText?: string;
	isEdit?: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	form: UseFormReturn<any>;
}

export const BaseModalForm = ({
	isOpen,
	onClose,
	onSubmit,
	title,
	children,
	isSubmitting = false,
	submitText = "登録",
	isEdit = false,
	form,
}: BaseModalFormProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-2xl max-w-full max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={onSubmit} className="space-y-4">
						{children}
						<div className="flex justify-end space-x-2">
							<Button type="button" variant="outline" onClick={onClose}>
								キャンセル
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "処理中..." : isEdit ? "更新" : submitText}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
