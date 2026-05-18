import React, { useEffect, useState } from "react";
import { Button } from "../../../shared/component/Button";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Modal from "../../../shared/component/Modal";
import ConfirmModal from "../../../shared/component/ConfirmModal";
import MultiSelect from "../../../shared/component/MultiSelect";
import Breadcrumbs from "../../../shared/component/Breadcrumbs";
import { toast } from "react-toastify";
import PaginationControls from "../../../shared/component/table/PaginationControls";
import DataTable from "../../../shared/component/table/DataTable";
import { Select } from "../../../shared/component/Select";
import { ROUTES as Routes } from "../../../app/router/routes";
import { useModalForm } from "../../../hooks/useModalForm";
import { usePagination } from "../../../hooks/usePagination";
import { createRoleUserSchema } from "../../../schemas/validation";
import ServiceFactory from "../../../services/serviceFactory";
import { usePermissions } from "../../../hooks/usePermissions";

const RoleUser: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [data, setData] = useState<any[]>([]);
  const [role, setRole] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [editingRoleUser, setEditingRoleUser] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    roleUser: any | null;
  }>({
    isOpen: false,
    roleUser: null,
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  // Check if user has any action permissions
  const hasActionPermissions = hasPermission('User', 'update') || hasPermission('User', 'delete');

  const pagination = usePagination();

  // Use service factory for centralized service management
  const roleUserService = ServiceFactory.roleUserService;
  const userService = ServiceFactory.userService;
  const roleService = ServiceFactory.roleService;

  const { open, setOpen, loading, modalRef, modalToggle, form, handleSubmit } =
    useModalForm({
      schema: createRoleUserSchema(),
      onSubmit: async (data: { role: string }) => {
        const submitData = {
          ...data,
          users: selectedUsers,
        };

        if (editingRoleUser) {
          // Update existing role user
          const response = await roleUserService.update(
            editingRoleUser._id,
            submitData,
          );
          return response;
        } else {
          // Create new role user
          const response = await roleUserService.create(submitData);
          return response;
        }
      },
      onSuccess: (message) => {
        toast.success(
          message ||
            (editingRoleUser
              ? "Role assignment updated successfully"
              : "Role assignment created successfully"),
        );
        // Refresh data after successful operation
        fetchRoleUsers();
        setEditingRoleUser(null);
        setSelectedUsers([]);
      },
      onError: (error) => {
        toast.error(
          error?.message ||
            "Role assignment operation failed. Please try again.",
        );
        console.error("Role error:", error);
      },
    });

  const { register, reset } = form;

  // Handle edit
  const handleEdit = (roleUser: any) => {
    setEditingRoleUser(roleUser);
    
    // Extract role ID from populated role object
    const roleId = roleUser.role?._id || roleUser.role;
    
    reset({
      role: roleId,
    });
    
    // Extract user IDs from populated users array
    const userIds = roleUser.users?.map((user: any) => user._id) || [];
    setSelectedUsers(userIds);
    
    setOpen(true);
  };

  // Handle delete
  const handleDelete = (roleUser: any) => {
    setDeleteConfirm({ isOpen: true, roleUser });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (deleteConfirm.roleUser) {
      try {
        await roleUserService.delete(deleteConfirm.roleUser._id);
        toast.success("Role deleted successfully");
        fetchRoleUsers();
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete role");
        console.error("Delete error:", error);
      } finally {
        setDeleteConfirm({ isOpen: false, roleUser: null });
      }
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, roleUser: null });
  };

  // Handle modal close
  const handleModalClose = () => {
    setOpen(false);
    setEditingRoleUser(null);
    reset();
  };

  // Fetch roles for dropdown
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await roleService.getAll();
        setRole(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchRoles();
  }, [roleService]);

  // Fetch users for multi-select
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userService.getAll();
        setUsers(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [userService]);

  // Fetch role users for table with pagination
  const fetchRoleUsers = async () => {
    try {
      const response = await roleUserService.getAll({
        page: pagination.page,
        limit: pagination.pageSize,
        search: pagination.searchText,
      });
      setData(response.data);
      pagination.setTotal(response.pagination.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRoleUsers();
  }, [
    pagination.page,
    pagination.pageSize,
    pagination.searchText,
    pagination.setTotal,
    roleUserService,
  ]);

  return (
    <>
      <div className="w-full">
        <Breadcrumbs
          className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800"
          headTitle="Mater Data"
          items={[{ label: "Role User", path: Routes.ROLE_USER }]}
        />
        <div className="flex justify-end mb-4 w-full">
          {hasPermission('User', 'create') && (
            <Button
              onClick={modalToggle}
              label={<PlusOutlined />}
              className="bg-blue-500"
              title="Assign User to Role"
            ></Button>
          )}
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-700">
          <div className="overflow-x-auto">
            <DataTable
              columns={[
                {
                  label: "Role",
                  key: "role",
                  render: (item: any) => item.role?.role || "Unknown Role",
                },
                {
                  label: "Users",
                  key: "users",
                  render: (item: any) => {
                    if (item.users && item.users.length > 0) {
                      return (
                        <div className="flex flex-wrap gap-1">
                          {item.users.map((user: any) => (
                            <span
                              key={user._id}
                              className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
                            >
                              {user.name}
                            </span>
                          ))}
                        </div>
                      );
                    }
                    return "-";
                  },
                },
                ...(hasActionPermissions ? [{
                  label: "Actions",
                  key: "actions",
                  render: (item: any) => (
                    <div className="flex justify-end space-x-0.5 min-w-[60px]">
                      {hasPermission('User', 'update') && (
                        <Button
                          onClick={() => handleEdit(item)}
                          label={<EditOutlined />}
                          className="bg-yellow-500 hover:bg-yellow-600 px-1 py-0.5 text-xs rounded w-6 h-6 flex items-center justify-center"
                          title="Edit User Assignment"
                        />
                      )}
                      {hasPermission('User', 'delete') && (
                        <Button
                          onClick={() => handleDelete(item)}
                          label={<DeleteOutlined />}
                          className="bg-red-500 hover:bg-red-600 px-1 py-0.5 text-xs rounded w-6 h-6 flex items-center justify-center"
                          title="Remove User Assignment"
                        />
                      )}
                      {!hasPermission('User', 'update') && !hasPermission('User', 'delete') && (
                        <span className="text-gray-400 text-xs">No permissions</span>
                      )}
                    </div>
                  ),
                }] : [])
              ]}
              data={data}
              loading={loading}
              rowKey="_id"
              skeletonRowCount={8}
            />

            <PaginationControls
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={pagination.setPage}
            />
          </div>
        </div>

        <ConfirmModal
          isOpen={deleteConfirm.isOpen}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Delete Role"
          message={`Are you sure you want to delete the role "${deleteConfirm.roleUser?.role}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />

        <Modal
          className="max-w-lg"
          ref={modalRef}
          title={editingRoleUser ? "Edit Role" : "Add Role"}
          isOpen={open}
          onClose={handleModalClose}
          onSave={handleSubmit}
        >
          <form onSubmit={handleSubmit}>
            <Select
              label="Select Role"
              {...register("role")}
              options={[
                { label: "Select Role", value: "" },
                ...role.map((item) => ({
                  label: item.role,
                  value: item._id,
                })),
              ]}
            />
            
            <MultiSelect
              label="Select Users"
              options={users.map((user) => ({
                label: `${user.name} (${user.email})`,
                value: user._id,
              }))}
              placeholder="Select users..."
              value={selectedUsers}
              onChange={setSelectedUsers}
            />
          </form>
        </Modal>
      </div>
    </>
  );
};
export default RoleUser;
