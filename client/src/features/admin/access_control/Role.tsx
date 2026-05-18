import React, { useEffect, useState } from "react";
import { Button } from "../../../shared/component/Button";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Modal from "../../../shared/component/Modal";
import ConfirmModal from "../../../shared/component/ConfirmModal";
import Breadcrumbs from "../../../shared/component/Breadcrumbs";
import { toast } from "react-toastify";
import { Textarea } from "../../../shared/component/Textarea";
import PaginationControls from "../../../shared/component/table/PaginationControls";
import DataTable from "../../../shared/component/table/DataTable";
import { Input } from "../../../shared/component/Input";
import { useModalForm } from "../../../hooks/useModalForm";
import { usePagination } from "../../../hooks/usePagination";
import { createRoleSchema } from "../../../schemas/validation";
import ServiceFactory from "../../../services/serviceFactory";
import { useLoader } from "../../../shared/hooks/useLoader";
import { usePermissions } from "../../../hooks/usePermissions";

const Role: React.FC = () => {
  const { simulateAsync } = useLoader();
  const { hasPermission } = usePermissions();
  const [data, setData] = useState<any[]>([]);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; role: any | null }>({
    isOpen: false,
    role: null
  });
  
  // Check if user has any action permissions
  const hasActionPermissions = hasPermission('Role', 'update') || hasPermission('Role', 'delete');
  
  const pagination = usePagination();
  
  // Use service factory for centralized service management
  const roleService = ServiceFactory.roleService;
  
  const { open, setOpen, loading, modalRef, modalToggle, form, handleSubmit } = useModalForm({
    schema: createRoleSchema(),
    onSubmit: async (data: { role: string; description: string }) => {
      if (editingRole) {
        // Update existing role
        const response = await roleService.update(editingRole._id, data);
        return response;
      } else {
        // Create new role
        const response = await roleService.create(data);
        return response;
      }
    },
    onSuccess: (message) => {
      toast.success(message || (editingRole ? "Role updated successfully" : "Role added successfully"));
      // Refresh data after successful operation
      fetchRoles();
      setEditingRole(null);
    },
    onError: (error) => {
      toast.error(error?.message || "Role operation failed. Please try again.");
      console.error("Role error:", error);
    }
  });
  
  const { register, reset } = form;

  // Handle edit
  const handleEdit = (role: any) => {
    setEditingRole(role);
    reset({
      role: role.role,
      description: role.description
    });
    setOpen(true);
  };

  // Handle delete
  const handleDelete = (role: any) => {
    setDeleteConfirm({ isOpen: true, role });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (deleteConfirm.role) {
      try {
        await roleService.delete(deleteConfirm.role._id);
        toast.success("Role deleted successfully");
        fetchRoles();
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete role");
        console.error("Delete error:", error);
      } finally {
        setDeleteConfirm({ isOpen: false, role: null });
      }
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, role: null });
  };

  // Handle modal close
  const handleModalClose = () => {
    setOpen(false);
    setEditingRole(null);
    reset();
  };

  // Fetch roles with pagination
  const fetchRoles = async () => {
    await simulateAsync(
      async () => {
        const response = await roleService.getAll({
          page: pagination.page,
          limit: pagination.pageSize,
          search: pagination.searchText
        });
        setData(response.data);
        pagination.setTotal(response.pagination.total);
      },
      "Loading Roles...",
      1500
    );
  };

  useEffect(() => {
    fetchRoles();
  }, [pagination.page, pagination.pageSize, pagination.searchText, pagination.setTotal, roleService]);

  return (
    <>
      <div className="w-full">
        <Breadcrumbs
          className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800"
          headTitle="Master Data"
          items={[{ label: "Role", path: "/role" }]}
        />
        <div className="flex justify-end mb-4 w-full">
          {hasPermission('role', 'create') && (
            <Button
              onClick={modalToggle}
              label={<PlusOutlined />}
              className="bg-blue-500"
              title="Add New Role"
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
                  render: (item) => item.role,
                },
                {
                  label: "Description",
                  key: "description",
                  render: (item) => item.description || "-",
                },
                ...(hasActionPermissions ? [{
                  label: "Actions",
                  key: "actions",
                  render: (item: any) => (
                    <div className="flex justify-end space-x-0.5 min-w-[60px]">
                      {hasPermission('Role', 'update') && (
                        <Button
                          onClick={() => handleEdit(item)}
                          label={<EditOutlined />}
                          className="bg-yellow-500 hover:bg-yellow-600 px-1 py-0.5 text-xs rounded w-6 h-6 flex items-center justify-center"
                          title="Edit Role"
                        />
                      )}
                      {hasPermission('Role', 'delete') && (
                        <Button
                          onClick={() => handleDelete(item)}
                          label={<DeleteOutlined />}
                          className="bg-red-500 hover:bg-red-600 px-1 py-0.5 text-xs rounded w-6 h-6 flex items-center justify-center"
                          title="Delete Role"
                        />
                      )}
                      {!hasPermission('Role', 'update') && !hasPermission('Role', 'delete') && (
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
          message={`Are you sure you want to delete the role "${deleteConfirm.role?.role}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />

        <Modal
          className="max-w-lg"
          ref={modalRef}
          title={editingRole ? "Edit Role" : "Add Role"}
          isOpen={open}
          onClose={handleModalClose}
          onSave={handleSubmit}
        >
          <form onSubmit={handleSubmit}>
            <Input {...register("role")} label="Enter Role" />
            <Textarea
              {...register("description")}
              label="Enter Description"
              labelclassName="mt-2"
            />
          </form>
        </Modal>
      </div>
    </>
  );
};
export default Role;
