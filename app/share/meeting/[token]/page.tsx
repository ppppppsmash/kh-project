import { getPublicMeetingByToken } from "@/actions/meeting";
import { getQA } from "@/actions/qa";
import { getTasks } from "@/actions/task";
import { getUserList } from "@/actions/user";
import { StatusLabel } from "@/components/meeting/status-label";
import { formatDate } from "@/lib/utils";
import type { AgendaItemFormValues } from "@/lib/validations";
import { notFound } from "next/navigation";

type LookupMaps = {
	userMap: Map<string | undefined, { name?: string }>;
	taskMap: Map<string | undefined, { title: string }>;
	qaMap: Map<string | undefined, { question: string }>;
};

const AgendaBlock = ({
	item,
	maps,
}: {
	item: AgendaItemFormValues;
	maps: LookupMaps;
}) => {
	const presenter = item.presenterId ? maps.userMap.get(item.presenterId) : null;
	const linkedTask = item.linkedTaskId
		? maps.taskMap.get(item.linkedTaskId)
		: null;
	const linkedQa = item.linkedQaId ? maps.qaMap.get(item.linkedQaId) : null;
	return (
		<section className="py-4">
			<div className="flex items-center gap-3 flex-wrap">
				<h3 className="text-xl font-semibold">{item.title}</h3>
				<StatusLabel type="agenda" value={item.status} />
				{presenter?.name && (
					<span className="text-sm text-muted-foreground">
						担当: {presenter.name}
					</span>
				)}
			</div>

			{item.description && (
				<p className="mt-3 whitespace-pre-wrap text-base leading-relaxed">
					{item.description}
				</p>
			)}

			{(linkedTask || linkedQa) && (
				<div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
					{linkedTask && (
						<span>
							<span className="mr-1 text-xs uppercase tracking-wide">
								task
							</span>
							{linkedTask.title}
						</span>
					)}
					{linkedQa && (
						<span>
							<span className="mr-1 text-xs uppercase tracking-wide">
								qa
							</span>
							{linkedQa.question}
						</span>
					)}
				</div>
			)}

			{item.memo && (
				<div className="mt-4 border-l-2 border-muted pl-4">
					<p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
						議事録
					</p>
					<p className="whitespace-pre-wrap text-sm leading-relaxed">
						{item.memo}
					</p>
				</div>
			)}
		</section>
	);
};

const MemoBlock = ({ item }: { item: AgendaItemFormValues }) => (
	<section className="py-4">
		{item.title && (
			<h3 className="mb-2 text-xl font-bold tracking-tight">{item.title}</h3>
		)}
		{item.description && (
			<p className="whitespace-pre-wrap text-base leading-relaxed">
				{item.description}
			</p>
		)}
	</section>
);

export default async function PublicMeetingPage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await params;
	const meeting = await getPublicMeetingByToken(token);
	if (!meeting?.id) {
		notFound();
	}

	const [users, tasks, qaItems] = await Promise.all([
		getUserList(),
		getTasks(),
		getQA(),
	]);

	const maps: LookupMaps = {
		userMap: new Map(users.map((u) => [u.id, u])),
		taskMap: new Map(tasks.map((t) => [t.id, t])),
		qaMap: new Map(qaItems.map((q) => [q.id, q])),
	};

	const items = meeting.items ?? [];
	const topLevel = items.filter((it) => !it.parentId);
	const childrenBySection = new Map<string, AgendaItemFormValues[]>();
	items.forEach((it) => {
		if (it.parentId) {
			const arr = childrenBySection.get(it.parentId) ?? [];
			arr.push(it);
			childrenBySection.set(it.parentId, arr);
		}
	});

	const renderItem = (item: AgendaItemFormValues) => {
		if (item.type === "memo") {
			return <MemoBlock key={item.id} item={item} />;
		}
		return <AgendaBlock key={item.id} item={item} maps={maps} />;
	};

	return (
		<article className="mx-auto max-w-3xl px-6 py-10">
			<header className="mb-8 border-b pb-6">
				<div className="mb-3 flex items-center gap-4">
					<StatusLabel type="meeting" value={meeting.status} />
					{meeting.scheduledAt && (
						<time className="text-sm text-muted-foreground">
							{formatDate(
								new Date(meeting.scheduledAt),
								"yyyy/MM/dd (E) HH:mm",
							)}
						</time>
					)}
				</div>
				<h1 className="text-4xl font-bold tracking-tight">{meeting.title}</h1>
			</header>

			{topLevel.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					ブロックが登録されていません。
				</p>
			) : (
				<div>
					{topLevel.map((item) => {
						if (item.type === "section") {
							const children = item.id
								? childrenBySection.get(item.id) ?? []
								: [];
							return (
								<section key={item.id} className="mt-10 first:mt-0">
									<h2 className="text-3xl font-bold tracking-tight border-b pb-2">
										{item.title}
									</h2>
									<div className="divide-y">
										{children.map((c) => renderItem(c))}
									</div>
								</section>
							);
						}
						return (
							<div key={item.id} className="divide-y">
								{renderItem(item)}
							</div>
						);
					})}
				</div>
			)}
		</article>
	);
}
