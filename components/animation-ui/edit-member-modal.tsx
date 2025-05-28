// "use client"

// import type React from "react"

// import { useState } from "react"
// import { motion, AnimatePresence } from "motion/react"
// import { X, User, Mail, Phone, MapPin, Camera, Save, ArrowLeft, ArrowRight, Check } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Card, CardContent } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import type { MemberFormValues } from "@/lib/validations"

// interface EditMemberModalProps {
//   isOpen: boolean
//   onClose: () => void
//   member?: MemberFormValues | null
// }

// const steps = [
//   { id: 1, title: "基本情報", icon: User },
//   { id: 2, title: "連絡先", icon: Mail },
//   { id: 3, title: "プロフィール", icon: Camera },
// ]

// export function EditMemberModal({ isOpen, onClose, member }: EditMemberModalProps) {
//   console.log("EditMemberModal rendered with isOpen:", isOpen) // デバッグ用

//   const [currentStep, setCurrentStep] = useState(1)
//   const [formData, setFormData] = useState<Partial<MemberFormValues>>({
//     name: member?.name || "",
//     email: member?.email || "",
//     phone: member?.phone || "",
//     address: member?.address || "",
//     bio: member?.bio || "",
//     avatar: member?.avatar || "",
//   })
//   const [dragActive, setDragActive] = useState(false)

//   const handleInputChange = (field: keyof MemberFormValues, value: string) => {
//     setFormData((prev) => ({ ...prev, [field]: value }))
//   }

//   const handleNext = () => {
//     if (currentStep < steps.length) {
//       setCurrentStep(currentStep + 1)
//     }
//   }

//   const handlePrev = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1)
//     }
//   }

//   const handleSave = () => {
//     console.log("保存データ:", formData)
//     onClose()
//   }

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault()
//     e.stopPropagation()
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true)
//     } else if (e.type === "dragleave") {
//       setDragActive(false)
//     }
//   }

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setDragActive(false)

//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       // ファイル処理ロジック
//       console.log("ファイルがドロップされました:", e.dataTransfer.files[0])
//     }
//   }

//   const renderStepContent = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             className="space-y-6"
//           >
//             <div className="text-center mb-6">
//               <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 基本情報
//               </h3>
//               <p className="text-muted-foreground mt-2">お名前と基本的な情報を入力してください</p>
//             </div>

//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
//                   <User className="h-4 w-4" />
//                   お名前
//                 </Label>
//                 <Input
//                   id="name"
//                   value={formData.name}
//                   onChange={(e) => handleInputChange("name", e.target.value)}
//                   placeholder="山田 太郎"
//                   className="h-12 border-2 focus:border-blue-500 transition-colors"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="bio" className="text-sm font-medium">
//                   自己紹介
//                 </Label>
//                 <Textarea
//                   id="bio"
//                   value={formData.bio}
//                   onChange={(e) => handleInputChange("bio", e.target.value)}
//                   placeholder="簡単な自己紹介をお書きください..."
//                   className="min-h-[100px] border-2 focus:border-blue-500 transition-colors resize-none"
//                 />
//               </div>
//             </div>
//           </motion.div>
//         )

//       case 2:
//         return (
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             className="space-y-6"
//           >
//             <div className="text-center mb-6">
//               <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
//                 連絡先情報
//               </h3>
//               <p className="text-muted-foreground mt-2">連絡先情報を入力してください</p>
//             </div>

//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
//                   <Mail className="h-4 w-4" />
//                   メールアドレス
//                 </Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={(e) => handleInputChange("email", e.target.value)}
//                   placeholder="example@email.com"
//                   className="h-12 border-2 focus:border-green-500 transition-colors"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
//                   <Phone className="h-4 w-4" />
//                   電話番号
//                 </Label>
//                 <Input
//                   id="phone"
//                   value={formData.phone}
//                   onChange={(e) => handleInputChange("phone", e.target.value)}
//                   placeholder="090-1234-5678"
//                   className="h-12 border-2 focus:border-green-500 transition-colors"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
//                   <MapPin className="h-4 w-4" />
//                   住所
//                 </Label>
//                 <Input
//                   id="address"
//                   value={formData.address}
//                   onChange={(e) => handleInputChange("address", e.target.value)}
//                   placeholder="東京都渋谷区..."
//                   className="h-12 border-2 focus:border-green-500 transition-colors"
//                 />
//               </div>
//             </div>
//           </motion.div>
//         )

//       case 3:
//         return (
//           <motion.div
//             initial={{ opacity: 0, x: 20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: -20 }}
//             className="space-y-6"
//           >
//             <div className="text-center mb-6">
//               <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//                 プロフィール画像
//               </h3>
//               <p className="text-muted-foreground mt-2">プロフィール画像をアップロードしてください</p>
//             </div>

//             <div className="flex flex-col items-center space-y-6">
//               <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
//                 <AvatarImage src={formData.avatar || "/placeholder.svg"} />
//                 <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-500 text-white">
//                   {formData.name?.charAt(0) || "?"}
//                 </AvatarFallback>
//               </Avatar>

//               <div
//                 className={`relative w-full max-w-md h-32 border-2 border-dashed rounded-lg transition-all duration-300 ${
//                   dragActive
//                     ? "border-purple-500 bg-purple-50"
//                     : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
//                 }`}
//                 onDragEnter={handleDrag}
//                 onDragLeave={handleDrag}
//                 onDragOver={handleDrag}
//                 onDrop={handleDrop}
//               >
//                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
//                   <Camera className="h-8 w-8 text-gray-400 mb-2" />
//                   <p className="text-sm text-gray-600">画像をドラッグ&ドロップ</p>
//                   <p className="text-xs text-gray-400 mt-1">または</p>
//                   <Button variant="outline" size="sm" className="mt-2">
//                     ファイルを選択
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         )

//       default:
//         return null
//     }
//   }

//   // isOpenがfalseの場合は何も表示しない
//   if (!isOpen) {
//     console.log("Modal is closed, returning null") // デバッグ用
//     return null
//   }

//   console.log("Modal is open, rendering content") // デバッグ用

//   return (
//     <div className="fixed inset-0 z-[9999]">
//       <AnimatePresence>
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
//           onClick={onClose}
//         >
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.9, y: 20 }}
//             transition={{ type: "spring", damping: 25, stiffness: 400 }}
//             className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <Card className="bg-white shadow-2xl border-0">
//               <CardContent className="p-0">
//                 {/* Header */}
//                 <div className="relative p-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={onClose}
//                     className="absolute right-4 top-4 text-white hover:bg-white/20 rounded-full"
//                   >
//                     <X className="h-5 w-5" />
//                   </Button>

//                   <div className="text-white">
//                     <h2 className="text-2xl font-bold mb-2">
//                       {member ? "メンバー情報を編集" : "新しいメンバーを追加"}
//                     </h2>
//                     <p className="opacity-90">
//                       ステップ {currentStep} / {steps.length}
//                     </p>
//                   </div>

//                   {/* Progress Bar */}
//                   <div className="mt-4 bg-white/20 rounded-full h-2">
//                     <motion.div
//                       className="bg-white rounded-full h-2"
//                       initial={{ width: 0 }}
//                       animate={{ width: `${(currentStep / steps.length) * 100}%` }}
//                       transition={{ duration: 0.3 }}
//                     />
//                   </div>
//                 </div>

//                 {/* Steps Navigation */}
//                 <div className="flex justify-center py-4 bg-gray-50">
//                   {steps.map((step, index) => (
//                     <div key={step.id} className="flex items-center">
//                       <motion.div
//                         className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
//                           currentStep >= step.id
//                             ? "bg-blue-500 border-blue-500 text-white"
//                             : "bg-white border-gray-300 text-gray-400"
//                         }`}
//                         whileHover={{ scale: 1.05 }}
//                       >
//                         {currentStep > step.id ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
//                       </motion.div>

//                       <div className="ml-2 mr-4">
//                         <Badge variant={currentStep >= step.id ? "default" : "secondary"}>{step.title}</Badge>
//                       </div>

//                       {index < steps.length - 1 && <div className="w-8 h-0.5 bg-gray-300 mr-4" />}
//                     </div>
//                   ))}
//                 </div>

//                 {/* Content */}
//                 <div className="p-8 min-h-[400px]">
//                   <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
//                 </div>

//                 {/* Footer */}
//                 <div className="flex justify-between items-center p-6 bg-gray-50 border-t">
//                   <Button
//                     variant="outline"
//                     onClick={handlePrev}
//                     disabled={currentStep === 1}
//                     className="flex items-center gap-2"
//                   >
//                     <ArrowLeft className="h-4 w-4" />
//                     前へ
//                   </Button>

//                   <div className="flex gap-2">
//                     {currentStep < steps.length ? (
//                       <Button
//                         onClick={handleNext}
//                         className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
//                       >
//                         次へ
//                         <ArrowRight className="h-4 w-4" />
//                       </Button>
//                     ) : (
//                       <Button
//                         onClick={handleSave}
//                         className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
//                       >
//                         <Save className="h-4 w-4" />
//                         保存
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   )
// }

export const EditMemberModal = () => {
  return (
    <>
      test
    </>
  )
};
