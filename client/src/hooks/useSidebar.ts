import {
  toggleSidebar,
  toggleMobileSidebar,
  setIsHovered,
  setActiveItem,
  toggleSubmenu,
} from "../redux/sidebarSlice";
import { useAppDispatch, useAppSelector } from "../hooks/hook";

export const useSidebar = () => {
  const dispatch = useAppDispatch();
  const sidebar = useAppSelector((state) => state.sidebar);

  return {
    isExpanded: sidebar.isMobile ? false : sidebar.isExpanded,
    isMobileOpen: sidebar.isMobileOpen,
    isHovered: sidebar.isHovered,
    activeItem: sidebar.activeItem,
    openSubmenu: sidebar.openSubmenu,

    toggleSidebar: () => dispatch(toggleSidebar()),
    toggleMobileSidebar: () => dispatch(toggleMobileSidebar()),
    setIsHovered: (value: boolean) => dispatch(setIsHovered(value)),
    setActiveItem: (value: string | null) =>
      dispatch(setActiveItem(value)),
    toggleSubmenu: (item: string) =>
      dispatch(toggleSubmenu(item)),
  };
};

export default useSidebar;