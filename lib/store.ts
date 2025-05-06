import { create } from "zustand";
import { persist } from "zustand/middleware";

// QAアイテムの型定義
export type QAItem = {
  id: string
  question: string
  answer: string | null
  category: string
  date: string
  status: "pending" | "answered"
  askedBy: string
}

// 初期データ
const initialQAItems: QAItem[] = [
  {
    id: "QA001",
    question: "社内Wi-Fiのパスワードはどこで確認できますか？",
    answer: "社内ポータルサイトのIT情報ページで確認できます。または、IT部門に問い合わせてください。",
    category: "IT",
    date: "2024-03-15",
    status: "answered",
    askedBy: "田中太郎",
  },
  {
    id: "QA002",
    question: "有給休暇の申請方法を教えてください。",
    answer:
      "勤怠管理システムから申請できます。申請は休暇の3日前までに行ってください。詳細は人事部のマニュアルを参照してください。",
    category: "人事",
    date: "2024-03-10",
    status: "answered",
    askedBy: "佐藤花子",
  },
  {
    id: "QA003",
    question: "経費精算の提出期限はいつですか？",
    answer: "経費精算は発生した月の翌月5日までに提出してください。期限を過ぎると次回の精算に回されます。",
    category: "経理",
    date: "2024-03-05",
    status: "answered",
    askedBy: "鈴木一郎",
  },
  {
    id: "QA004",
    question: "社内メールのパスワードをリセットする方法は？",
    answer: "IT部門のポータルサイトからパスワードリセットが可能です。または、IT部門（内線: 1234）に連絡してください。",
    category: "IT",
    date: "2024-02-28",
    status: "answered",
    askedBy: "高橋和子",
  },
  {
    id: "QA005",
    question: "会議室の予約方法を教えてください。",
    answer:
      "社内カレンダーシステムから予約可能です。予約は使用する30分前までに行ってください。キャンセルも同システムから行えます。",
    category: "総務",
    date: "2024-02-20",
    status: "answered",
    askedBy: "伊藤健太",
  },
  {
    id: "QA006",
    question: "社内研修の参加申し込み方法は？",
    answer:
      "人事部からのお知らせメールに記載されているリンクから申し込みできます。定員に達した場合は次回の案内をお待ちください。",
    category: "人事",
    date: "2024-02-15",
    status: "answered",
    askedBy: "渡辺真理",
  },
  {
    id: "QA007",
    question: "プリンターの使い方がわかりません。",
    answer:
      "各プリンター横に簡易マニュアルがあります。また、IT部門のポータルサイトに詳細なマニュアルがあります。トラブル時は内線1234までご連絡ください。",
    category: "IT",
    date: "2024-02-10",
    status: "answered",
    askedBy: "山本雄太",
  },
  {
    id: "QA008",
    question: "社員証を紛失した場合はどうすればいいですか？",
    answer:
      "総務部（内線: 2345）に直ちに連絡してください。再発行には手数料1,000円がかかります。再発行までは臨時IDカードを発行します。",
    category: "総務",
    date: "2024-02-05",
    status: "answered",
    askedBy: "中村美咲",
  },
  {
    id: "QA009",
    question: "社内システムにアクセスできない場合はどうすればいいですか？",
    answer:
      "まずはパソコンの再起動を試してください。それでも解決しない場合は、IT部門（内線: 1234）に連絡してください。",
    category: "IT",
    date: "2024-01-30",
    status: "answered",
    askedBy: "小林健太",
  },
  {
    id: "QA010",
    question: "在宅勤務の申請方法を教えてください。",
    answer:
      "勤怠管理システムから「在宅勤務申請」を選択して申請できます。申請は原則として3日前までに行い、上長の承認が必要です。",
    category: "人事",
    date: "2024-01-25",
    status: "answered",
    askedBy: "加藤美咲",
  },
]

// ストアの型定義
type QAStore = {
  qaItems: QAItem[]
  addQuestion: (question: string, category: string, askedBy: string) => void
  answerQuestion: (id: string, answer: string, category: string) => void
  updateQA: (id: string, updatedQA: Partial<QAItem>) => void
  deleteQA: (id: string) => void
}

// Zustandストアの作成
export const useQAStore = create<QAStore>()(
  persist(
    (set) => ({
      qaItems: initialQAItems,

      // 新しい質問を追加
      addQuestion: (question, category, askedBy) => {
        set((state) => {
          const newId = `QA${String(state.qaItems.length + 1).padStart(3, "0")}`
          const today = new Date().toISOString().split("T")[0]

          const newQuestion: QAItem = {
            id: newId,
            question,
            answer: null,
            category,
            date: today,
            status: "pending",
            askedBy,
          }

          return { qaItems: [...state.qaItems, newQuestion] }
        })
      },

      // 質問に回答
      answerQuestion: (id, answer, category) => {
        set((state) => {
          const updatedItems = state.qaItems.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                answer,
                category,
                status: "answered" as const,
              }
            }
            return item
          })

          return { qaItems: updatedItems }
        })
      },

      // QAを更新
      updateQA: (id, updatedQA) => {
        set((state) => {
          const updatedItems = state.qaItems.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                ...updatedQA,
              }
            }
            return item
          })

          return { qaItems: updatedItems }
        })
      },

      // QAを削除
      deleteQA: (id) => {
        set((state) => ({
          qaItems: state.qaItems.filter((item) => item.id !== id),
        }))
      },
    }),
    {
      name: "qa-storage", // ローカルストレージのキー
    },
  ),
)
