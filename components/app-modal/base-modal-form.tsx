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
import { motion, useMotionValue } from "motion/react";
import { useState } from "react";
import { GripVertical } from "lucide-react";

interface BaseModalFormProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (e: React.FormEvent) => Promise<void>;
	title: string;
	children: ReactNode;
	isSubmitting?: boolean;
	submitText?: string;
	isEdit?: boolean;
	onClear?: () => void;
	showClearButton?: boolean;
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
	onClear,
	showClearButton = false,
	form,
}: BaseModalFormProps) => {
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	return (
		<>
		{isOpen && (
			// backdrop-blur-xs
			<div className="fixed inset-0 top-0 left-0 z-50 bg-black/25 w-full h-full" />
		)}
			<motion.div
				className="w-full fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] z-50"
				style={{ x, y }}
			>
				<Dialog open={isOpen} onOpenChange={onClose}>
					
						<DialogContent className="sm:max-w-2xl max-w-full max-h-[90vh] overflow-y-auto p-0">
							<div 
								className="cursor-move select-none bg-muted/50 border-b border-border hover:bg-muted/70 transition-colors duration-200 p-4 rounded-t-lg"
								onMouseDown={(e) => {
									// ヘッダー部分でのマウスダウンのみでドラッグを開始
									const target = e.target as HTMLElement;
									if (e.target === e.currentTarget || target.closest('[data-drag-handle]')) {
										e.preventDefault();
										const startX = e.clientX - x.get();
										const startY = e.clientY - y.get();
										
										const handleMouseMove = (moveEvent: MouseEvent) => {
											const newX = moveEvent.clientX - startX;
											const newY = moveEvent.clientY - startY;
											x.set(newX);
											y.set(newY);
										};
										
										const handleMouseUp = () => {
											document.removeEventListener('mousemove', handleMouseMove);
											document.removeEventListener('mouseup', handleMouseUp);
										};
										
										document.addEventListener('mousemove', handleMouseMove);
										document.addEventListener('mouseup', handleMouseUp);
									}
								}}
							>
								<div data-drag-handle className="flex items-center gap-3">
									<GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
									<DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
								</div>
							</div>
							<div className="p-6">
								<Form {...form}>
									<form onSubmit={onSubmit} className="space-y-4">
										{children}
										<div className="flex justify-between items-center">
											{showClearButton && onClear && (
												<Button type="button" variant="outline" onClick={onClear}>
													クリア
												</Button>
											)}
											<div className="flex justify-end space-x-2 ml-auto">
												<Button type="button" variant="outline" onClick={onClose}>
													キャンセル
												</Button>
												<Button type="submit" disabled={isSubmitting}>
													{isSubmitting ? "処理中..." : isEdit ? "更新" : submitText}
												</Button>
											</div>
										</div>
									</form>
								</Form>
							</div>
						</DialogContent>
				</Dialog>
			</motion.div>
		</>
	);
};
