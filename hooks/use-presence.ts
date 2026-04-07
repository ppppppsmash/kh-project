import { heartbeat, getOnlineUsers } from "@/actions/presence";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const HEARTBEAT_INTERVAL = 30 * 1000; // 30秒
const POLL_INTERVAL = 10 * 1000; // 10秒（オンライン一覧の更新頻度）

export const usePresence = () => {
	// 定期的に heartbeat を送信
	useEffect(() => {
		// 初回即送信
		heartbeat();

		const interval = setInterval(() => {
			heartbeat();
		}, HEARTBEAT_INTERVAL);

		return () => clearInterval(interval);
	}, []);

	// オンラインユーザーを取得（30秒ごとに再取得）
	const { data: onlineUsers = [] } = useQuery({
		queryKey: ["online-users"],
		queryFn: getOnlineUsers,
		refetchInterval: POLL_INTERVAL,
	});

	return { onlineUsers };
};
