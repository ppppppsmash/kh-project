import {
  IconCamera,
  //TODO: 今後使用するかも
  IconUsersGroup,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconConfetti,
  IconReport,
  IconSearch,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";

// ナビゲーションの設定
export const navConfig = {
  navMain: [
    {
      title: "ダッシュボード",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "メンバー",
      url: "/member",
      icon: IconUser,
      items: [
        {
          title: "自己紹介一覧",
          url: "/member/intro-card",
        },
      ],
    },
    {
      title: "チーム",
      url: "/team",
      icon: IconUsersGroup,
      items: [
        {
          title: "一覧",
          url: "#",
        },
        {
          title: "週報",
          url: "#",
        },
      ],
    },
    {
      title: "部活動",
      url: "/club-activity",
      icon: IconConfetti,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
};

// 部活動のステータスの設定
export const statusConfig = {
  active: { label: "活動中", color: "bg-green-100 text-green-800" },
  inactive: { label: "休止中", color: "bg-gray-100 text-gray-800" },
  pending: { label: "承認待ち", color: "bg-yellow-100 text-yellow-800" },
};

export const clubActivityItems = [
  {
    title: "部活動名",
    key: "name",
    sortable: true,
  },
  {
    title: "部長",
    key: "leader",
    sortable: true,
  },
  {
    title: "活動内容",
    key: "description",
    sortable: false,
    hide: "md",
  },
  {
    title: "メンバー数",
    key: "memberCount",
    sortable: true,
    hide: "lg",
  },
  {
    title: "ステータス",
    key: "status",
    sortable: true,
    hide: "md",
  },
  {
    title: "操作",
    key: "action",
    sortable: false,
    align: "right",
  },
];
