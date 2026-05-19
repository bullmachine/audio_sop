import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./routes";
import NotFound from "../../pages/NotFound";
import Home from "../../pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import GuestLayout from "../../layouts/GuestLayout";
import AppLayout from "../../layouts/AppLayout";
import Login from "../../features/auth/Login";
import Register from "../../features/auth/Register";
import Dashboard from "../../features/admin/Dashboard";
import type { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../../hooks/hook";
import { useEffect } from "react";
import { initializeAuth, fetchUserPermissions } from "../../redux/authSlice";
import { STORAGE_KEYS } from "../../services/storage";
import Role from "../../features/admin/access_control/Role";
import RoleUser from "../../features/admin/access_control/RoleUser";
import Permission from "../../features/admin/access_control/Permission";
import UserPermissionAssignment from "../../features/admin/access_control/UserPermissionAssignment";
import Profile from "../../features/admin/Profile"; 
import Stage from "../../features/admin/master/Stage";
import Language from "../../features/admin/master/Language";
import OperatorPage from "../../features/admin/master/Operator";
import AudioFile from "../../features/admin/master/AudioFile";
import Product from "../../features/admin/master/Product";
import OperatorDashboard from "../../features/operator/OperatorDashboard";

const AppRoutes = () => {
  const dispatch = useAppDispatch();

  const permissionsLoaded = useSelector(
    (state: RootState) => state.auth.permissionsLoaded
  );

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token && !permissionsLoaded) {
      dispatch(initializeAuth());
      // Fetch user permissions only if not already loaded
      dispatch(fetchUserPermissions());
    }
  }, [dispatch, permissionsLoaded]);

  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  const protectedRoutes = [
    { 
      path: ROUTES.DASHBOARD, 
      element: <Dashboard />,
      requiredPermissions: [ ]
    },
    { 
      path: ROUTES.STAGE, 
      element: <Stage />,
      requiredPermissions: [ ]
    },
    { 
      path: ROUTES.LANGUAGE, 
      element: <Language />,
      requiredPermissions: [ ]
    },
    { 
      path: ROUTES.OPERATOR, 
      element: <OperatorPage />,
      requiredPermissions: [ ]
    },
    { 
      path: ROUTES.AUDIO_FILES, 
      element: <AudioFile />,
      requiredPermissions: [ ]
    },
    { 
      path: ROUTES.MY_AUDIO, 
      element: <OperatorDashboard />,
      requiredPermissions: [ ]
    },
    { 
      path: ROUTES.PRODUCT, 
      element: <Product />,
      requiredPermissions: [ ]
    },
    { 
      path: ROUTES.ROLE, 
      element: <Role />,
      requiredPermissions: [{ module: "Role", action: "view" }]
    },
    { 
      path: ROUTES.ROLE_USER, 
      element: <RoleUser />,
      requiredPermissions: [{ module: "Role User", action: "view" }]
    },
    { 
      path: ROUTES.PERMISSION, 
      element: <Permission />,
      requiredPermissions: [{ module: "Permission", action: "view" }]
    },
    { 
      path: ROUTES.USER_PERMISSIONS, 
      element: <UserPermissionAssignment />,
      requiredPermissions: [{ module: "User Permissions", action: "view" }]
    }, 
    { 
      path: "/profile", 
      element: <Profile />,
      requiredPermissions: []
    },      
  ];

  return (
    <Routes>
      {/* Guest Routes */}
      <Route element={<GuestLayout />}>
        <Route
          path={ROUTES.ROOT}
          element={<Navigate to={ROUTES.HOME} replace />}
        />
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
      </Route>

      {/* Protected Routes */}
      {isAuthenticated ? (
        <Route element={<AppLayout />}>
          {protectedRoutes.map(({ path, element, requiredPermissions }) => (
            <Route 
              key={path} 
              path={path} 
              element={
                <ProtectedRoute 
                  requiredPermissions={requiredPermissions}
                  fallbackPath="/dashboard"
                >
                  {element}
                </ProtectedRoute>
              } 
            />
          ))}
        </Route>
      ) : (
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      )}

      {/* Catch all */}
      <Route path="/" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
