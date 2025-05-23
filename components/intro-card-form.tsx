"use client";

import { ImageUpload } from "@/components/image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
//import { createIntroCard } from "@/actions/intro-card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export const IntroCardForm = () => {
	const [name, setName] = useState("");
	const [department, setDepartment] = useState("");
	const [position, setPosition] = useState("");
	const [hobby, setHobby] = useState("");
	const [skills, setSkills] = useState("");
	const [freeText, setFreeText] = useState("");
	const [photo, setPhoto] = useState<File | null>(null);
	const [isPending, startTransition] = useTransition();
	const [createdCardId, setCreatedCardId] = useState<string | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const router = useRouter();

	const handleSubmit = () => {
		startTransition(async () => {
			// const newMember = await createIntroCard({
			//   name,
			//   department,
			//   position,
			//   hobby,
			//   skills,
			//   freeText,
			//   photo
			// });

			setName("");
			setDepartment("");
			setPosition("");
			setHobby("");
			setSkills("");
			setFreeText("");
			setPhoto(null);
			// setCreatedCardId(newMember.id);
			// setIsDialogOpen(true);
			// router.refresh();
		});
	};

	const handlePhotoChange = (file: File) => {
		setPhoto(file);
	};

	const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

	return (
		<div className="min-h-[90%] flex items-center justify-center">
			<Card className="max-w-2xl mx-auto p-6 h-[80svh] overflow-y-auto">
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">
						自己紹介
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmit();
						}}
						className="space-y-6"
					>
						<div className="space-y-2">
							<Label htmlFor="photo">プロフィール写真</Label>
							<ImageUpload onUploadComplete={handlePhotoChange} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="name">名前</Label>
							<Input
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="名前を入力"
								required
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="department">事業部</Label>
								<Input
									id="department"
									value={department}
									onChange={(e) => setDepartment(e.target.value)}
									placeholder="事業部を入力"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="position">役職</Label>
								<Input
									id="position"
									value={position}
									onChange={(e) => setPosition(e.target.value)}
									placeholder="役職を入力"
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="skills">得意な技術・スキル</Label>
							<Textarea
								id="skills"
								value={skills}
								onChange={(e) => setSkills(e.target.value)}
								placeholder="得意な技術やスキルを入力"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="hobby">趣味・特技</Label>
							<Textarea
								id="hobby"
								value={hobby}
								onChange={(e) => setHobby(e.target.value)}
								placeholder="趣味や特技を入力"
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="freeText">自由記載欄</Label>
							<Textarea
								id="freeText"
								value={freeText}
								onChange={(e) => setFreeText(e.target.value)}
								placeholder="自由にメッセージを入力"
								className="h-32"
							/>
						</div>

						<Button type="submit" disabled={isPending} className="w-full">
							{isPending ? "送信中..." : "送信"}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>自己紹介カードのURL</DialogTitle>
						<DialogDescription>
							このURLを共有することで、他の人に自己紹介カードを見てもらうことができます。
						</DialogDescription>
					</DialogHeader>
					<div className="flex items-center gap-2">
						<Input
							value={`${baseUrl}/external/intro-card/${createdCardId}`}
							readOnly
							className="flex-1"
						/>
						<CopyButton
							value={`${baseUrl}/external/intro-card/${createdCardId}`}
						/>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
