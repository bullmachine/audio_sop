import { Outlet } from "react-router-dom";

const GuestLayout = () => {
  return (
    <div className="relative">
      <Outlet />
    </div>
  );
};

export default GuestLayout;
