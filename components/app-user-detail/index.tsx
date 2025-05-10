"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";
import { Building2, Briefcase, Heart, Code2, MessageSquare, Calendar } from "lucide-react";

interface UserDetailProps {
  user?: User;
}

export const UserDetail = ({ user }: UserDetailProps) => {
  return (
    <div className="container mx-auto">
      <Card className="overflow-hidden border-none shadow-lg">
        <CardContent className="p-0">
          <div className="grid md:grid-cols-2 gap-2 p-8">
            {/* 左側：プロフィール画像 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative w-80 h-80 rounded-lg overflow-hidden shadow-xl">
                {user?.photoUrl ? (
                  <Image
                    src={user.photoUrl}
                    alt={user.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-lg">No Image</span>
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {user?.name}
              </h1>
            </div>

            <div className="space-y-6">
              {/* 基本情報 */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-5 h-5" />
                    <h3 className="font-medium">事業部</h3>
                  </div>
                  <p className="text-lg">{user?.department || "未設定"}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-5 h-5" />
                    <h3 className="font-medium">役職</h3>
                  </div>
                  <p className="text-lg">{user?.position || "未設定"}</p>
                </div>
              </div>

              {/* 趣味・特技 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Heart className="w-5 h-5" />
                  <h3 className="font-medium">趣味・特技</h3>
                </div>
                <p className="text-lg whitespace-pre-line bg-white p-4 rounded-lg shadow-sm">
                  {user?.hobby || "未設定"}
                </p>
              </div>

              {/* スキル */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Code2 className="w-5 h-5" />
                  <h3 className="font-medium">得意な技術・スキル</h3>
                </div>
                <p className="text-lg whitespace-pre-line bg-white p-4 rounded-lg shadow-sm">
                  {user?.skills || "未設定"}
                </p>
              </div>

              {/* 自由記載欄 */}
              {user?.freeText && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MessageSquare className="w-5 h-5" />
                    <h3 className="font-medium">自由記載欄</h3>
                  </div>
                  <p className="text-lg whitespace-pre-line bg-white p-4 rounded-lg shadow-sm">
                    {user.freeText}
                  </p>
                </div>
              )}

              {/* 日付情報 */}
              <div className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>登録: {formatDate(user?.createdAt ?? new Date(), "yyyy/MM/dd")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>更新: {formatDate(user?.editedAt ?? new Date(), "yyyy/MM/dd")}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 