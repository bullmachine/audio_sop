import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import useSidebar from "../hooks/useSidebar";
import { DownOutlined as ChevronDownIcon } from "@ant-design/icons";
import { type MenuItem, MenuItems } from "../app/router/routes";
import { usePermissions } from "../hooks/usePermissions";

const Sidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  
  // Move useSelector calls to the top level to avoid hook order issues
  const user = useSelector((state: any) => state.auth.user);

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => {
      if (!path) return false;
      
      // Since hash is empty, use pathname and remove base path and hash
      const currentPath = location.pathname
        .replace('/audio_sop', '')
        .replace('#', '') || '/';
            
      // Special case: Requests module should match both /request and /request-list
      if (path === '/request' && (currentPath === '/request' || currentPath === '/request-list')) {
        return true;
      }
      
      // Exact match for other routes
      return currentPath === path;
    },
    [location.pathname]
  );

  // Function to check if user has permission for a menu item
  const hasMenuItemPermission = useCallback((menuItem: MenuItem) => {
    // Super admin bypass - show all menu items if user is super admin
    // Normalize role by removing whitespace and converting to lowercase
    const userRole = typeof user?.role === 'string' 
      ? user.role.toLowerCase().replace(/\s+/g, '')
      : user?.role?.role?.toLowerCase().replace(/\s+/g, '');
      
    if (userRole === 'superadmin') {
      return true;
    }
    
    // If no permissions required, allow access
    if (!menuItem.requiredPermissions || menuItem.requiredPermissions.length === 0) {
      return true;
    }
    
    // Check if user has any of the required permissions
    return menuItem.requiredPermissions.some(({ module, action }) => {
      // For specific permissions, check exact match
      return hasPermission(module, action);
    });
  }, [hasPermission, user]);

  // Function to filter submenu items based on permissions
  const filterSubItems = useCallback((subItems?: MenuItem['subItems']) => {
    if (!subItems) return [];
    
    // Super admin bypass - show all submenu items if user is super admin
    // Normalize role by removing whitespace and converting to lowercase
    const userRole = typeof user?.role === 'string' 
      ? user.role.toLowerCase().replace(/\s+/g, '')
      : user?.role?.role?.toLowerCase().replace(/\s+/g, '');
      
    if (userRole === 'superadmin') {
      return subItems;
    }
    
    return subItems.filter(subItem => {
      if (!subItem.requiredPermissions || subItem.requiredPermissions.length === 0) {
        return true;
      }
      
      const hasRequiredPermission = subItem.requiredPermissions.some(({ module, action }) => 
        hasPermission(module, action)
      );       
      return hasRequiredPermission;
    });
  }, [hasPermission, user]);

  // Function to filter menu items based on permissions
  const filterMenuItems = useCallback((items: MenuItem[]) => {
    return items.filter(item => {
      // Check main item permission
      if (!hasMenuItemPermission(item)) {
        return false;
      }

      // If item has sub-items, check if user has permission for at least one sub-item
      if (item.subItems && item.subItems.length > 0) {
        const accessibleSubItems = filterSubItems(item.subItems);
        return accessibleSubItems.length > 0;
      }

      // If no sub-items, return the main item permission check
      return true;
    });
  }, [hasMenuItemPermission, filterSubItems]);

  // Check if menu item should be active (including submenu items)
  const isMenuItemActive = useCallback((menuItem: MenuItem) => {
    // Check if main item path is active
    if (menuItem.path && isActive(menuItem.path)) {
      return true;
    }
    
    // Check if any submenu item is active
    if (menuItem.subItems) {
      const accessibleSubItems = filterSubItems(menuItem.subItems);
      return accessibleSubItems.some(subItem => 
        subItem.path && isActive(subItem.path)
      );
    }
    
    return false;
  }, [isActive, filterSubItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  // Memoize filtered menu items to prevent infinite re-renders
  const filteredMenuItems = useMemo(() => {
    return filterMenuItems(MenuItems);
  }, [filterMenuItems]);

  // Auto-open submenu if current route matches a submenu item (simplified to avoid infinite loop)
  useEffect(() => {
    const currentPath = location.pathname
      .replace('/audio_sop', '')
      .replace('#', '') || '/';
    let shouldOpenSubmenu = false;
    let submenuIndex = -1;

    filteredMenuItems.forEach((item: MenuItem, index: number) => {
      if (item.subItems) {
        const accessibleSubItems = filterSubItems(item.subItems);
        const hasActiveSubItem = accessibleSubItems.some(subItem => 
          subItem.path && currentPath === subItem.path
        );
        
        if (hasActiveSubItem) {
          shouldOpenSubmenu = true;
          submenuIndex = index;
        }
      }
    });

    if (shouldOpenSubmenu && submenuIndex !== -1) {
      setOpenSubmenu({ type: "main", index: submenuIndex });
    }
  }, [location.pathname]);  

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: MenuItem[], menuType: "main" | "others") => {
    // Filter menu items based on user permissions
    const filteredItems = filterMenuItems(items);
    
    if (filteredItems.length === 0) {
      return null; // Don't render empty menu sections
    }

    return (
      <ul className="flex flex-col gap-4">
        {filteredItems.map((nav, index) => (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index, menuType)}
                className={`menu-item group ${
                  isMenuItemActive(nav)
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } cursor-pointer ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size md:mr-2 mr-1  ${
                    isMenuItemActive(nav)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto transition-transform duration-300 ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? "rotate-180"
                        : "rotate-0"
                    }`}
                  />
                )}
              </button>
            ) : (
              <Link
                to={nav.path || '/'}
                className={`menu-item ${
                  isActive(nav.path || "")
                    ? "menu-item-active"
                    : "menu-item-inactive"
                } ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "lg:justify-start"
                }`}
              >
                <span
                  className={`menu-item-icon-size md:mr-2 mr-1 ${
                    isActive(nav.path || "")
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => {
                  subMenuRefs.current[`${menuType}-${index}`] = el;
                }}
                className="overflow-hidden transition-all duration-300"
                style={{
                  height:
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? `${subMenuHeight[`${menuType}-${index}`]}px`
                      : "0px",
                }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {filterSubItems(nav.subItems).map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`menu-dropdown-item ${
                          isActive(subItem.path)
                            ? "menu-dropdown-item-active"
                            : "menu-dropdown-item-inactive"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {subItem.icon && (
                            <span className="menu-dropdown-icon">
                              {subItem.icon}
                            </span>
                          )}
                          {subItem.name}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 dark:text-white h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                src="images/bull-logo-text.png"
                alt="Logo"
                width={64}
                height={36}
                className="dark:invert"
              />
            </>
          ) : (
            <img
              src="images/bull-logo-text.png"
              alt="Logo"
              width={36}
              height={36}
              className="dark:invert"
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? "Menu" : "...."}
              </h2>
              {renderMenuItems(MenuItems, "main")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
