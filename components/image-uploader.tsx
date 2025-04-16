"use client"

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImageUploadProps {
  onUploadComplete?: (file: File) => void
  maxSizeMB?: number
  acceptedFileTypes?: string[]
}

export const ImageUpload = ({
  onUploadComplete,
  maxSizeMB = 5,
  acceptedFileTypes = ["image/jpeg", "image/png", "image/webp"],
}: ImageUploadProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルタイプの検証
    if (!acceptedFileTypes.includes(file.type)) {
      setError(`対応していないファイル形式です。${acceptedFileTypes.join(", ")}のみ対応しています。`)
      return
    }

    // ファイルサイズの検証
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`ファイルサイズが大きすぎます。${maxSizeMB}MB以下のファイルを選択してください。`)
      return
    }

    setError(null)
    setSelectedImage(file)
    if (onUploadComplete) {
      onUploadComplete(file)
    }

    // プレビュー用のURLを作成
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
  }

  const resetUpload = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-4">
        {/* 画像プレビュー */}
        {previewUrl ? (
          <div className="relative rounded-lg overflow-hidden border border-border">
            <div className="aspect-video relative">
              <Image src={previewUrl || "/placeholder.svg"} alt="プレビュー" fill className="object-cover" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background"
              onClick={resetUpload}
              aria-label="画像を削除"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-muted-foreground/40 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">画像をアップロード</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              クリックのみ<br />ドラッグ＆ドロップはまだ実装していない
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {acceptedFileTypes.join(", ")} • 最大 {maxSizeMB}MB
            </p>
          </div>
        )}

        {/* 入力フィールド */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedFileTypes.join(",")}
          className="hidden"
          aria-label="ファイルを選択"
        />

        {/* エラーメッセージ */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
