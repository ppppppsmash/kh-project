"use client";

import { updateUserInfo } from "@/actions/user";
import { UserModalForm } from "@/components/app-modal/member-modal-form";
import { useGetUserInfo } from "@/components/app-table/hooks/use-table-data";
import { UserDetail } from "@/components/app-user-detail";
import { EditButton } from "@/components/edit-button";
import { CustomToast } from "@/components/ui/toast";
import { useModal } from "@/hooks/use-modal";
import { useSubmit } from "@/lib/submitHandler";
import type { MemberFormValues } from "@/lib/validations";
import { useQueryClient } from "@tanstack/react-query";
import { PageTitle } from "@/components/animation-ui/page-title"
import { getNavTitle } from "@/config";

export default function UserPage() {
	const queryClient = useQueryClient();
	const { data: userInfo, isLoading: isUserInfoLoading } = useGetUserInfo();
	const { isOpen, openModal, closeModal } = useModal();

	const { handleSubmit } = useSubmit<MemberFormValues>({
		action: async (data) => {
			if (userInfo?.id) {
				await updateUserInfo(userInfo.id, data);
			}
		},
		onSuccess: () => {
			closeModal();
			CustomToast.success("メンバー情報を更新しました");
			queryClient.invalidateQueries({ queryKey: ["user-info"] });
		},
		onError: () => {
			CustomToast.error("メンバー情報の更新に失敗しました");
		},
	});

	const handleEdit = () => {
		openModal();
	};

	return (
		<div className="mx-auto">
			<div className="flex justify-between items-center mb-6">
				<PageTitle>{getNavTitle("/superadmin/member/intro")}</PageTitle>
				<EditButton text="編集" onClick={handleEdit} />
			</div>
			<div className="space-y-8 overflow-y-auto h-[calc(100svh-100px)]">
				<UserModalForm
					isOpen={isOpen}
					onClose={closeModal}
					onSubmit={handleSubmit}
					defaultValues={userInfo}
				/>

				<UserDetail user={userInfo} />
			</div>
		</div>
	);
}
