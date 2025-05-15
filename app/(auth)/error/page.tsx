"use client";

import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
	const searchParams = useSearchParams();
	const error = searchParams.get("error");

	return (
		<div className="p-8 text-center">
			<h1 className="text-2xl font-bold mb-4">ログインに失敗しました</h1>
			{error === "AccessDenied" && (
				<p className="text-red-500">
					このアカウントにはアクセス権限がありません。
				</p>
			)}
		</div>
	);
}
