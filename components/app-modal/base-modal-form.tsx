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
import { motion } from "motion/react";

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
		<>
		{isOpen && (
			// backdrop-blur-xs
			<div className="fixed inset-0 top-0 left-0 z-50 bg-black/25 w-full h-full" />
		)}
			<motion.div
				drag
					dragConstraints={{ top: -1000, bottom: 1000, left: -1000, right: 1000 }}
					dragElastic={0.2}
					className="w-full fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50"
				>
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
			</motion.div>
		</>
	);
};
