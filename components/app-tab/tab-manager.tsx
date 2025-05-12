"use client";

import { useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CustomToast } from "@/components/ui/toast";
import { createTab, updateTab, deleteTab, getTabs } from "@/actions/tab";
import { useSubmit } from "@/lib/submitHandler";

interface Tab {
  id: string;
  name: string;
}

interface TabManagerProps {
  onTabSelect: (tabId: string) => void;
  selectedTabId?: string;
}

export function TabManager({ onTabSelect, selectedTabId }: TabManagerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<Tab | null>(null);
  const [newTabName, setNewTabName] = useState("");
  const queryClient = useQueryClient();

  const { data: tabs = [], isLoading } = useQuery({
    queryKey: ["tabs"],
    queryFn: getTabs,
  });

  const { handleSubmit: handleCreateTab } = useSubmit({
    action: async () => {
      await createTab(newTabName);
    },
    onSuccess: () => {
      setIsAddModalOpen(false);
      setNewTabName("");
      CustomToast.success("タブを作成しました");
      queryClient.invalidateQueries({ queryKey: ["tabs"] });
    },
    onError: () => {
      CustomToast.error("タブの作成に失敗しました");
    },
  });

  const { handleSubmit: handleUpdateTab } = useSubmit({
    action: async () => {
      if (currentTab) {
        await updateTab(currentTab.id, newTabName);
      }
    },
    onSuccess: () => {
      setIsEditModalOpen(false);
      setNewTabName("");
      setCurrentTab(null);
      CustomToast.success("タブを更新しました");
      queryClient.invalidateQueries({ queryKey: ["tabs"] });
    },
    onError: () => {
      CustomToast.error("タブの更新に失敗しました");
    },
  });

  const handleDelete = async () => {
    if (currentTab) {
      try {
        await deleteTab(currentTab.id);
        setIsDeleteModalOpen(false);
        setCurrentTab(null);
        CustomToast.success("タブを削除しました");
        queryClient.invalidateQueries({ queryKey: ["tabs"] });
      } catch (error) {
        CustomToast.error("タブの削除に失敗しました");
      }
    }
  };

  if (isLoading) {
    return <div>タブを読み込み中...</div>;
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">タブ一覧</h3>
        <Button onClick={() => setIsAddModalOpen(true)}>新規タブを追加</Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center gap-2 p-2 rounded-lg border ${
              selectedTabId === tab.id ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div
              className="cursor-pointer"
              onClick={() => onTabSelect(tab.id)}
            >
              {tab.name}
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentTab(tab);
                  setNewTabName(tab.name);
                  setIsEditModalOpen(true);
                }}
              >
                編集
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setCurrentTab(tab);
                  setIsDeleteModalOpen(true);
                }}
              >
                削除
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 新規タブ作成モーダル */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新規タブを作成</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTab}>
            <Input
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              placeholder="タブ名を入力"
              className="mb-4"
            />
            <DialogFooter>
              <Button type="submit">作成</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* タブ編集モーダル */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タブを編集</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTab}>
            <Input
              value={newTabName}
              onChange={(e) => setNewTabName(e.target.value)}
              placeholder="タブ名を入力"
              className="mb-4"
            />
            <DialogFooter>
              <Button type="submit">更新</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* タブ削除確認モーダル */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>タブを削除</DialogTitle>
          </DialogHeader>
          <p>このタブを削除してもよろしいですか？</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 