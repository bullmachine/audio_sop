import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  AppstoreOutlined,
  SoundOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import Breadcrumbs from "../../shared/component/Breadcrumbs";
import ServiceFactory from "../../services/serviceFactory";
import { useLoader } from "../../shared/hooks/useLoader";
import { Link } from "react-router-dom";
import { ROUTES } from "../../app/router/routes";

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  path: string;
  color: string;
}

const Dashboard: React.FC = () => {
  const { simulateAsync } = useLoader();
  const [stats, setStats] = useState({ operators: 0, products: 0, stages: 0, audioSops: 0 });

  const fetchStats = async () => {
    const [operators, products, stages, audioSops] = await Promise.all([
      ServiceFactory.operatorService.getAll({ page: 1, limit: 1 }),
      ServiceFactory.productService.getAll({ page: 1, limit: 1 }),
      ServiceFactory.stageService.getAll({ page: 1, limit: 1 }),
      ServiceFactory.audioSopService.getAll({ page: 1, limit: 1 }),
    ]);

    setStats({
      operators: operators.pagination?.total || 0,
      products: products.pagination?.total || 0,
      stages: stages.pagination?.total || 0,
      audioSops: audioSops.pagination?.total || 0,
    });
  };

  useEffect(() => {
    simulateAsync(fetchStats, "Loading dashboard...", 600);
  }, []);

  const cards: StatCard[] = [
    {
      label: "Operators",
      value: stats.operators,
      icon: <UserOutlined className="text-2xl" />,
      path: ROUTES.OPERATOR,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "KMAT Products",
      value: stats.products,
      icon: <AppstoreOutlined className="text-2xl" />,
      path: ROUTES.PRODUCT,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      label: "Stages",
      value: stats.stages,
      icon: <ToolOutlined className="text-2xl" />,
      path: ROUTES.STAGE,
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Audio Assignments",
      value: stats.audioSops,
      icon: <SoundOutlined className="text-2xl" />,
      path: ROUTES.AUDIO_FILES,
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  return (
    <div className="w-full">
      <Breadcrumbs
        className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800 mb-6"
        headTitle="Admin Dashboard"
        items={[{ label: "Dashboard", path: ROUTES.DASHBOARD }]}
      />

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Audio Management System
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage operators, KMAT products, stages, and audio SOP assignments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.path}
            className={`block p-5 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <div className="opacity-80">{card.icon}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Link to={ROUTES.OPERATOR} className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm">
              + Create Operator
            </Link>
            <Link to={ROUTES.PRODUCT} className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm">
              + Add KMAT Product
            </Link>
            <Link to={ROUTES.AUDIO_FILES} className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm">
              + Upload & Assign Audio Files
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">System Overview</h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex justify-between">
              <span>Role-based access control</span>
              <span className="text-green-600 font-medium">Active</span>
            </li>
            <li className="flex justify-between">
              <span>Secure authentication</span>
              <span className="text-green-600 font-medium">JWT</span>
            </li>
            <li className="flex justify-between">
              <span>Drag-and-drop file ordering</span>
              <span className="text-green-600 font-medium">Enabled</span>
            </li>
            <li className="flex justify-between">
              <span>Operator audio isolation</span>
              <span className="text-green-600 font-medium">Enforced</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
