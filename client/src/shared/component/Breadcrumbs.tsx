import React from "react";
import { HomeOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showTitle?: boolean;
  title?: string;
  separator?: React.ReactNode;
  headTitle?: string;
  headPath?: string;
}


const Breadcrumbs = ({
  items,
  className = "",
  showTitle = true,
  title = "",
  separator = (
    <svg
      className="w-4 h-4 mx-1.5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  headTitle = " ",
  // headPath= ''
}: BreadcrumbsProps) => {
  const location = useLocation();

  const breadcrumbItems: BreadcrumbItem[] =
    items ??
    location.pathname
      .split("/")
      .filter(Boolean)
      .map((segment, index, arr) => ({
        label: formatBreadcrumbName(segment),
        path: "/" + arr.slice(0, index + 1).join("/"),
      }));

  const pageTitle = title || breadcrumbItems[breadcrumbItems.length - 1]?.label;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 ${className}`}>
      {showTitle && (
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          {pageTitle || headTitle}
        </h2>
      )}

      <nav>
        <ol className="flex items-center flex-wrap gap-1.5">
          {/* <li className="flex items-center">
            <Link
              to={headPath}
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600"
            >
              <HomeOutlined />
              {headTitle}
            </Link>
          </li> */}

          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;

            return (
              <li key={index} className="flex items-center">
                {index > 0 && separator}
                {isLast || (!item.path && !item.onClick) ? (
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {item.label}
                  </span>
                ) : item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer bg-transparent border-none p-0"
                  >
                    {index === 0 ? (
                      <>
                        <HomeOutlined />
                        <span className="ml-1.5">{item.label}</span>
                      </>
                    ) : (
                      item.label
                    )}
                  </button>
                ) : item.path && index === 0 ? (
                  <Link
                    to={item.path}
                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-300 hover:text-blue-600"
                  >
                    <HomeOutlined />
                    {item.label}
                  </Link>
                ) : item.path ? (
                  <Link
                    to={item.path}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

// Helper function to format the breadcrumb name
const formatBreadcrumbName = (name: string): string => {
  if (!name) return '';
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default Breadcrumbs;
