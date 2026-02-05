"use client";

import { getSurvey, getSurveyResponses } from "@/actions/survey";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SurveyResponsesPage() {
	const params = useParams();
	const surveyId = params.id as string;

	const { data: survey, isLoading: isSurveyLoading } = useQuery({
		queryKey: ["survey", surveyId],
		queryFn: () => getSurvey(surveyId),
		enabled: !!surveyId,
	});

	const { data: responses, isLoading: isResponsesLoading } = useQuery({
		queryKey: ["survey-responses", surveyId],
		queryFn: () => getSurveyResponses(surveyId),
		enabled: !!surveyId,
	});

	// 質問IDと質問内容のマッピング
	const questionMap = useMemo(() => {
		if (!survey?.items) return new Map();
		const map = new Map();
		for (const item of survey.items) {
			if (item.id) {
				map.set(item.id, item);
			}
		}
		return map;
	}, [survey?.items]);

	if (isSurveyLoading || isResponsesLoading) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">読み込み中...</div>
			</div>
		);
	}

	if (!survey) {
		return (
			<div className="container mx-auto py-8">
				<div className="text-center">アンケートが見つかりません</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto py-8 max-w-6xl">
			<div className="mb-6">
				<Link href="/superadmin/survey">
					<Button variant="ghost" size="sm">
						<ArrowLeft className="h-4 w-4 mr-2" />
						アンケート一覧に戻る
					</Button>
				</Link>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{survey.title}</CardTitle>
					<CardDescription>
						回答数: {responses?.length || 0}件
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{!responses || responses.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							まだ回答がありません
						</div>
					) : (
						<div className="max-h-[calc(100vh-300px)] overflow-y-auto px-6 py-4 space-y-6">
							{responses.map((response, index) => (
								<Card key={response.id}>
									<CardHeader className="pb-3">
										<CardTitle className="text-lg">
											回答 {responses.length - index}
										</CardTitle>
										<CardDescription>
											{response.respondentName && (
												<span>回答者: {response.respondentName} / </span>
											)}
											回答日時:{" "}
											{response.submittedAt
												? new Date(response.submittedAt).toLocaleString("ja-JP")
												: "不明"}
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										{response.items.map((item) => {
											const question = questionMap.get(item.surveyItemId);
											if (!question) return null;

											let answerDisplay: string;
											try {
												// JSON形式の可能性があるため、パースを試みる
												const parsed = JSON.parse(item.answer);
												answerDisplay = Array.isArray(parsed)
													? parsed.join(", ")
													: parsed;
											} catch {
												answerDisplay = item.answer;
											}

											return (
												<div key={item.surveyItemId} className="space-y-1">
													<div className="font-medium text-sm text-muted-foreground">
														{question.question}
													</div>
													<div className="text-base">{answerDisplay || "（未回答）"}</div>
												</div>
											);
										})}
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
