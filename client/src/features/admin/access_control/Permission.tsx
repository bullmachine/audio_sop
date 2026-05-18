import React, { useEffect, useState } from "react";
import { Button } from "../../../shared/component/Button";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Modal from "../../../shared/component/Modal";
import ConfirmModal from "../../../shared/component/ConfirmModal";
import Checkbox from "../../../shared/component/Checkbox";
import Breadcrumbs from "../../../shared/component/Breadcrumbs";
import { toast } from "react-toastify";
import PaginationControls from "../../../shared/component/table/PaginationControls";
import DataTable from "../../../shared/component/table/DataTable";
import { Input } from "../../../shared/component/Input";
import { useModalForm } from "../../../hooks/useModalForm";
import { usePagination } from "../../../hooks/usePagination";
import { createPermissionSchema } from "../../../schemas/validation";
import ServiceFactory from "../../../services/serviceFactory";
import { useLoader } from "../../../shared/hooks/useLoader";
import { usePermissions } from "../../../hooks/usePermissions";

const Permission: React.FC = () => {
  const { simulateAsync } = useLoader();
  const { hasPermission } = usePermissions();
  const [data, setData] = useState<any[]>([]);
  const [editingPermission, setEditingPermission] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; permission: any | null }>({
    isOpen: false,
    permission: null
  });
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [isHeading, setIsHeading] = useState(false);
  
  // Check if user has any action permissions
  const hasActionPermissions = hasPermission('Permission', 'update') || hasPermission('Permission', 'delete');
  
  const pagination = usePagination();
  
  // Use service factory for centralized service management
  const permissionService = ServiceFactory.permissionService;
  const permissionCreateService = ServiceFactory.permissionCreateService;
  const permissionUpdateModuleService = ServiceFactory.permissionUpdateModuleService;
  
  const { open, setOpen, loading, modalRef, modalToggle, form, handleSubmit } = useModalForm({
    schema: createPermissionSchema(),
    onSubmit: async (data: { module: string }) => {
      const submitData = {
        module: data.module,
        isHeading: isHeading,
        actions: selectedActions
      };
      
      if (editingPermission) {
        // Update existing module permissions
        const response = await permissionUpdateModuleService.create(submitData);
        return response;
      } else {
        // Create new permissions using special endpoint
        const response = await permissionCreateService.create(submitData);
        return response;
      }
    },
    onSuccess: (message) => {
      toast.success(message || (editingPermission ? "Permission updated successfully" : "Permissions created successfully"));
      // Refresh data after successful operation
      fetchPermissions();
      setEditingPermission(null);
      setSelectedActions([]);
      setIsHeading(false);
    },
    onError: (error) => {
      toast.error(error?.message || "Permission operation failed. Please try again.");
      console.error("Permission error:", error);
    }
  });
  
  const { register, reset } = form;

  // Handle edit
  const handleEdit = (permission: any) => {
    setEditingPermission(permission);
    reset({
      module: permission.module,
    });
    setSelectedActions([permission.action]);
    setIsHeading(permission.isHeading || false);
    setOpen(true);
  };

  // Handle delete
  const handleDelete = (permission: any) => {
    setDeleteConfirm({ isOpen: true, permission });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (deleteConfirm.permission) {
      try {
        await permissionService.delete(deleteConfirm.permission._id);
        toast.success("Permission deleted successfully");
        fetchPermissions();
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete permission");
        console.error("Delete error:", error);
      } finally {
        setDeleteConfirm({ isOpen: false, permission: null });
      }
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, permission: null });
  };

  // Handle modal close
  const handleModalClose = () => {
    setOpen(false);
    setEditingPermission(null);
    reset();
    setSelectedActions([]);
    setIsHeading(false);
  };

  // Handle heading checkbox change
  const handleHeadingChange = (checked: boolean) => {
    setIsHeading(checked);
    if (checked) {
      // If heading, only allow view action
      setSelectedActions(['view']);
    } else {
      // If not heading, clear view action and allow all actions
      setSelectedActions(selectedActions.filter(action => action !== 'view'));
    }
  };

  // Handle action checkbox change
  const handleActionChange = (action: string, checked: boolean) => {
    if (isHeading && action !== 'view') {
      // If heading, don't allow non-view actions
      return;
    }
    
    if (checked) {
      setSelectedActions([...selectedActions, action]);
    } else {
      setSelectedActions(selectedActions.filter(a => a !== action));
    }
  };

  // Fetch permissions with pagination
  const fetchPermissions = async () => {
    await simulateAsync(
      async () => {
        const response = await permissionService.getAll({
          page: pagination.page,
          limit: pagination.pageSize,
          search: pagination.searchText
        });
        setData(response.data);
        pagination.setTotal(response.pagination.total);
      },
      "Loading Permissions...",
      1500
    );
  };

  useEffect(() => {
    fetchPermissions();
  }, [pagination.page, pagination.pageSize, pagination.searchText, pagination.setTotal, permissionService]);

  return (
    <>
      <div className="w-full">
        <Breadcrumbs
          className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800"
          headTitle="Master Data"
          items={[{ label: "Permissions", path: "/permission" }]}
        />
        <div className="flex justify-end mb-4 w-full">
          {hasPermission('Permission', 'create') && (
            <Button
              onClick={modalToggle}
              label={<PlusOutlined />}
              className="bg-blue-500"
              title="Add New Permission"
            ></Button>
          )}
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-700">
          <div className="overflow-x-auto">
            <DataTable
              columns={[
                {
                  label: "Permission Name",
                  key: "name",
                  render: (item) => item.name,
                },
                {
                  label: "Description",
                  key: "description",
                  render: (item) => item.description,
                },
                {
                  label: "Module",
                  key: "module",
                  render: (item) => item.module,
                },
                {
                  label: "Action",
                  key: "action",
                  render: (item) => (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800">
                      {item.action}
                    </span>
                  ),
                },
                {
                  label: "Is Heading",
                  key: "isHeading",
                  render: (item) => (
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm ${
                      item.isHeading ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.isHeading ? 'Yes' : 'No'}
                    </span>
                  ),
                },
                ...(hasActionPermissions ? [{
                  label: "Actions",
                  key: "actions",
                  render: (item: any) => (
                    <div className="flex justify-end space-x-0.5 min-w-[60px]">
                      {hasPermission('Permission', 'update') && (
                        <Button
                          onClick={() => handleEdit(item)}
                          label={<EditOutlined />}
                          className="bg-yellow-500 hover:bg-yellow-600 px-1 py-0.5 text-xs rounded w-6 h-6 flex items-center justify-center"
                          title="Edit Permission"
                        />
                      )}
                      {hasPermission('Permission', 'delete') && (
                        <Button
                          onClick={() => handleDelete(item)}
                          label={<DeleteOutlined />}
                          className="bg-red-500 hover:bg-red-600 px-1 py-0.5 text-xs rounded w-6 h-6 flex items-center justify-center"
                          title="Delete Permission"
                        />
                      )}
                      {!hasPermission('Permission', 'update') && !hasPermission('Permission', 'delete') && (
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
          title="Delete Permission"
          message={`Are you sure you want to delete the permission "${deleteConfirm.permission?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />

        <Modal
          className="max-w-lg"
          ref={modalRef}
          title={editingPermission ? "Edit Permission" : "Create Permissions"}
          isOpen={open}
          onClose={handleModalClose}
          onSave={handleSubmit}
        >
          <form onSubmit={handleSubmit}>
            <Input
              {...register("module")}
              label="Module Name"
              placeholder="Enter module name (e.g., role, user, product)"
            />
            
            <div className="mt-4">
              <Checkbox
                id="isHeading"
                label="Mark as Heading"
                checked={isHeading}
                onChange={handleHeadingChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                If marked as heading, only view permission will be created
              </p>
            </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actions
            </label>
            <div className="space-y-2">
              {!isHeading && (
                <>
                  <Checkbox
                    id="read"
                    label="Read"
                    checked={selectedActions.includes('read')}
                    onChange={(checked) => handleActionChange('read', checked)}
                  />
                  <Checkbox
                    id="delete"
                    label="Delete"
                    checked={selectedActions.includes('delete')}
                    onChange={(checked) => handleActionChange('delete', checked)}
                  />
                  <Checkbox
                    id="create"
                    label="Create"
                    checked={selectedActions.includes('create')}
                    onChange={(checked) => handleActionChange('create', checked)}
                  />
                  <Checkbox
                    id="update"
                    label="Update"
                    checked={selectedActions.includes('update')}
                    onChange={(checked) => handleActionChange('update', checked)}
                  />
                </>
              )}
              {isHeading && (
                <Checkbox
                  id="view"
                  label="View"
                  checked={selectedActions.includes('view')}
                  onChange={(checked) => handleActionChange('view', checked)}
                />
              )}
            </div>
            {isHeading && (
              <p className="text-xs text-blue-600 mt-2">
                Note: Heading modules only support view permissions
              </p>
            )}
          </div>
        </form>
        </Modal>
      </div>
    </>
  );
};

export default Permission;
