"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";

interface UserDetailProps {
  user?: User;
}

export const UserDetail = ({ user }: UserDetailProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="w-full mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              {user?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              {user?.photoUrl ? (
                <Image
                  src={user.photoUrl}
                  alt={user.name}
                  width={400}
                  height={400}
                  className="rounded-md"
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-500">事業部</h3>
                <p>{user?.department}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-500">役職</h3>
                <p>{user?.position}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-500">趣味・特技</h3>
              <p className="whitespace-pre-line">{user?.hobby}</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-500">得意な技術・スキル</h3>
              <p className="whitespace-pre-line">{user?.skills}</p>
            </div>

            {user?.freeText && (
              <div>
                <h3 className="font-semibold text-gray-500">自由記載欄</h3>
                <p className="whitespace-pre-line">{user?.freeText}</p>
              </div>
            )}

            <div className="text-sm text-gray-500">
              登録日: {formatDate(user?.createdAt ?? new Date(), "yyyy/MM/dd HH:mm")}
            </div>

            <div className="text-sm text-gray-500">
              更新日: {formatDate(user?.editedAt ?? new Date(), "yyyy/MM/dd HH:mm")}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 