"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Building } from "lucide-react";
import { motion } from "motion/react";

interface Member {
  id: string
  name: string
  position: "manager" | "leader" | "specialist" | "member"
  department: "application" | "cloud"
  email: string
  skills: string[]
  joinDate: string
  avatar?: string
  children?: Member[]
}

interface OrganizationChartProps {
  data: Member
  onMemberClick?: (member: Member) => void
  className?: string
}

interface NodeData {
  data: Member
}

interface TransformedData {
  id: string
  name: string
  data: Member
  children: TransformedData[]
}

// 職位の色分け
const positionColors = {
  manager: "bg-gradient-to-r from-red-500 to-red-600 text-white",
  leader: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
  specialist: "bg-gradient-to-r from-green-500 to-green-600 text-white",
  member: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
}

// 職位の日本語表示
const positionLabels = {
  manager: "マネージャー",
  leader: "リーダー",
  specialist: "スペシャリスト",
  member: "メンバー",
}

// 部署の日本語表示
const departmentLabels = {
  application: "アプリケーション部",
  cloud: "クラウド部",
}

// カスタムノードコンポーネント
const CustomNode: React.FC<{ node: NodeData }> = ({ node }) => {
  const member = node.data

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="w-64 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-300">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm truncate">{member.name}</h3>
              <Badge className={`text-xs ${positionColors[member.position]}`}>
                {positionLabels[member.position]}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-xs text-gray-600">
              <Building className="h-3 w-3 mr-1" />
              {departmentLabels[member.department]}
            </div>
            
            <div className="flex items-center text-xs text-gray-600">
              <User className="h-3 w-3 mr-1" />
              {member.email}
            </div>
            
            <div className="flex flex-wrap gap-1">
              {member.skills.slice(0, 2).map((skill) => (
                <Badge key={`${member.id}-${skill}`} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {member.skills.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{member.skills.length - 2}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export const OrganizationChart: React.FC<OrganizationChartProps> = ({
  data,
  onMemberClick,
  className
}) => {
  // データ構造に変換
  const transformData = (member: Member): TransformedData => {
    return {
      id: member.id,
      name: member.name,
      data: member,
      children: member.children?.map(transformData) || []
    }
  }

  return (
    <div className={`w-full overflow-auto ${className}`}>
      <div className="min-w-full min-h-[600px] p-8">
        <div className="orgchart-container">
          <div className="orgchart">
            <ul className="orgchart-list">
              <li className="orgchart-item">
                <div className="orgchart-node">
                  <CustomNode node={{ data: data }} />
                </div>
                {data.children && data.children.length > 0 && (
                  <ul className="orgchart-list">
                    {data.children.map((child) => (
                      <li key={child.id} className="orgchart-item">
                        <div className="orgchart-node">
                          <CustomNode node={{ data: child }} />
                        </div>
                        {child.children && child.children.length > 0 && (
                          <ul className="orgchart-list">
                            {child.children.map((grandChild) => (
                              <li key={grandChild.id} className="orgchart-item">
                                <div className="orgchart-node">
                                  <CustomNode node={{ data: grandChild }} />
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// 組織図用のCSSスタイル
export const OrganizationChartStyles = () => (
  <style jsx global>{`
    .orgchart-container {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
    
    .orgchart {
      display: flex;
      justify-content: center;
      padding: 20px;
    }
    
    .orgchart-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }
    
    .orgchart-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      margin: 0 20px;
    }
    
    .orgchart-node {
      position: relative;
      margin-bottom: 20px;
    }
    
    .orgchart-list:not(:first-child)::before {
      content: '';
      position: absolute;
      top: -20px;
      left: 50%;
      width: 2px;
      height: 20px;
      background: linear-gradient(to bottom, #e5e7eb, #d1d5db);
      transform: translateX(-50%);
    }
    
    .orgchart-item:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 50%;
      right: -20px;
      width: 20px;
      height: 2px;
      background: linear-gradient(to right, #e5e7eb, #d1d5db);
      transform: translateY(-50%);
    }
    
    .orgchart-item:last-child::after {
      display: none;
    }
    
    @media (max-width: 768px) {
      .orgchart-list {
        flex-direction: column;
        align-items: center;
      }
      
      .orgchart-item {
        margin: 10px 0;
      }
      
      .orgchart-item:not(:last-child)::after {
        display: none;
      }
    }
  `}</style>
) 