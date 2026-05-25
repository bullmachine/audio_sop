import { 
  DashboardOutlined,
//   SettingOutlined,
  ToolOutlined,
//   DollarOutlined,
  FileTextOutlined,
//   HistoryOutlined,
  TeamOutlined,
  UserOutlined,
  KeyOutlined,
  SafetyOutlined,
  AudioOutlined,
  SoundOutlined,
  AppstoreOutlined,
//   CrownOutlined,
//   CloudSyncOutlined
} from "@ant-design/icons";

import React from "react";

export const ROUTES = {
    ROOT: "/",
    HOME: "/home",
    LOGIN: "/login",
    REGISTER: "/register",
    DASHBOARD: "/dashboard",
    STAGE: "/stage",
    LANGUAGE: "/language",
    ROLE: "/role",
    ROLE_USER: "/role_user",
    PERMISSION: "/permission",
    USER_PERMISSIONS: "/user-permissions",
    MY_AUDIO: "/my-audio",
    PRODUCT: "/product",
    OPERATOR: "/operator",
    AUDIO_FILES: "/audio-files",
    EMPLOYEES: "/employees",
    SOP: "/sop",
};

export type MenuItem = {
    name: string;
    icon: React.ReactNode;
    path?: string;
    subItems?: { name: string; path: string; icon?: React.ReactNode; requiredPermissions?: Array<{ module: string; action: string }> }[];
    requiredPermissions?: Array<{ module: string; action: string }>;
};

export const MenuItems: MenuItem[] = [
    {
        name: "Dashboard",
        path: ROUTES.DASHBOARD,
        icon: <DashboardOutlined />,
        requiredPermissions: []
    },
    {
        name: "My Audio",
        path: ROUTES.MY_AUDIO,
        icon: <AudioOutlined />,
        requiredPermissions: [ ]
    },    
    {
        name: "Process Master",
        icon: <ToolOutlined />,
        subItems: [
            {
                name: "Stage",
                path: ROUTES.STAGE,
                icon: <ToolOutlined />,
                requiredPermissions: [ ]
            },           
            {
                name: "Language",
                path: ROUTES.LANGUAGE,
                icon: <FileTextOutlined />,
                requiredPermissions: [ ]
            },     
            {
                name: "Operators",
                path: ROUTES.OPERATOR,
                icon: <UserOutlined />,
                requiredPermissions: [ ],
            },
            {
                name: "KMAT Products",
                path: ROUTES.PRODUCT,
                icon: <AppstoreOutlined />,
                requiredPermissions: [ ],
            },          
            {
                name: "Audio Files",
                path: ROUTES.AUDIO_FILES,
                icon: <SoundOutlined />,
                requiredPermissions: [],
            },
            {
                name: "SOP",
                path: ROUTES.SOP,
                icon: <FileTextOutlined />,
                requiredPermissions: [],
            },
       
         ]
    },
    {
        name: "Access Control",
        icon: <SafetyOutlined />,
        subItems: [
            { 
                name: "Roles", 
                path: ROUTES.ROLE, 
                icon: <TeamOutlined />,
                requiredPermissions: [{ module: "Role", action: "view" }]
            }, 
            { 
                name: "Role User", 
                path: ROUTES.ROLE_USER, 
                icon: <UserOutlined />,
                requiredPermissions: [{ module: "Role User", action: "view" }]
            }, 
            { 
                name: "Permissions", 
                path: ROUTES.PERMISSION, 
                icon: <SafetyOutlined />,
                requiredPermissions: [{ module: "Permission", action: "view" }]
            }, 
            { 
                name: "User Permissions", 
                path: ROUTES.USER_PERMISSIONS, 
                icon: <KeyOutlined />,
                requiredPermissions: [{ module: "User Permissions", action: "view" }]
            }
        ]
    },
    {
        name: "Employees",
        path: ROUTES.EMPLOYEES,
        icon: <TeamOutlined />,
        requiredPermissions: []
    }
];