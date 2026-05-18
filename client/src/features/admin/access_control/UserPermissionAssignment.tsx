import React, { useEffect, useState } from "react";
import { Button } from "../../../shared/component/Button";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Modal from "../../../shared/component/Modal";
import Checkbox from "../../../shared/component/Checkbox";
import Breadcrumbs from "../../../shared/component/Breadcrumbs";
import { toast } from "react-toastify";
import PaginationControls from "../../../shared/component/table/PaginationControls";
import DataTable from "../../../shared/component/table/DataTable";
import { Select } from "../../../shared/component/Select";
import MultiSelect from "../../../shared/component/MultiSelect";
import { useModalForm } from "../../../hooks/useModalForm";
import { usePagination } from "../../../hooks/usePagination";
import ServiceFactory from "../../../services/serviceFactory";
import { assignUserPermissionSchema } from "../../../schemas/validation";
import { usePermissions } from "../../../hooks/usePermissions";

const UserPermissionAssignment: React.FC = () => {
  const { hasPermission } = usePermissions();
  const [data, setData] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [roleUsers, setRoleUsers] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    assignment: any | null;
  }>({
    isOpen: false,
    assignment: null,
  });
  
  // Check if user has any action permissions
  const hasActionPermissions = hasPermission('User', 'update') || hasPermission('User', 'delete');

  const pagination = usePagination();

  // Use service factory for centralized service management
  const userPermissionService = ServiceFactory.userPermissionService;
  const userPermissionAssignService =
    ServiceFactory.userPermissionAssignService;
  const userPermissionRemoveService =
    ServiceFactory.userPermissionRemoveService;
  const userService = ServiceFactory.userService;
  const roleUserService = ServiceFactory.roleUserService;
  const permissionService = ServiceFactory.permissionService;

  // Create a custom service for the /users endpoint
  const userPermissionUsersService = ServiceFactory.createService<any>(
    "/userPermission/users",
  );

  const { open, setOpen, loading, modalRef, modalToggle, form, handleSubmit } =
    useModalForm({
      schema: assignUserPermissionSchema(),
      onSubmit: async () => {
        // Validation: At least one selection required (user OR role) and permissions
        if (!selectedUsers.length && !selectedRole) {
          toast.error("Please select users or a role");
          return;
        }

        if (!selectedPermissions.length) {
          toast.error("Please select at least one permission");
          return;
        }

        const submitData: any = {
          permissionIds: selectedPermissions,
        };

        if (selectedUsers.length) {
          // Multiple users assignment
          submitData.userIds = selectedUsers;
        } else if (selectedRole) {
          // Role-based assignment - assign to all users in the role
          const selectedRoleUser = roleUsers.find(
            (ru) => ru.role._id === selectedRole,
          );
          if (selectedRoleUser && selectedRoleUser.users) {
            submitData.userIds = selectedRoleUser.users.map(
              (user: any) => user._id,
            );
          }
        }

        if (editingAssignment) {
          // Update existing assignment
          const response = await userPermissionAssignService.create(submitData);
          return response;
        } else {
          // Create new assignment
          const response = await userPermissionAssignService.create(submitData);
          return response;
        }
      },
      onSuccess: (message) => {
        toast.success(message || "Permissions assigned successfully");
        fetchUserPermissions();
        setEditingAssignment(null);
        setSelectedUsers([]);
        setSelectedPermissions([]);
      },
      onError: (error) => {
        toast.error(
          error?.message || "Permission assignment failed. Please try again.",
        );
        console.error("Assignment error:", error);
      },
    });

  const { reset } = form;

  // Handle edit
  const handleEdit = (assignment: any) => {
    setEditingAssignment(assignment);
    reset({
      userId: assignment.user._id,
    });
    setSelectedUsers([assignment.user._id]); // Set as array for multi-select
    setSelectedPermissions(assignment.permissions.map((p: any) => p._id));
    setOpen(true);
  };

  // Handle delete
  const handleDelete = (assignment: any) => {
    setDeleteConfirm({ isOpen: true, assignment });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (deleteConfirm.assignment) {
      try {
        await userPermissionRemoveService.create({
          userId: deleteConfirm.assignment.user._id,
          permissionId:
            deleteConfirm.assignment.permissions[0]?._id ||
            deleteConfirm.assignment._id,
        });
        toast.success("Permission assignment deleted successfully");
        fetchUserPermissions();
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete assignment");
        console.error("Delete error:", error);
      } finally {
        setDeleteConfirm({ isOpen: false, assignment: null });
      }
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, assignment: null });
  };

  // Handle modal close
  const handleModalClose = () => {
    setOpen(false);
    setEditingAssignment(null);
    reset();
    setSelectedUsers([]);
    setSelectedPermissions([]);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(
        selectedPermissions.filter((id) => id !== permissionId),
      );
    }
  };

  const handleHeadingChange = (moduleGroup: any, checked: boolean) => {
    const modulePermissionIds = moduleGroup.permissions.map((p: any) => p._id);

    if (checked) {
      const newPermissions = [...selectedPermissions];
      modulePermissionIds.forEach((id: string) => {
        if (!newPermissions.includes(id)) {
          newPermissions.push(id);
        }
      });
      setSelectedPermissions(newPermissions);
    } else {
      setSelectedPermissions(
        selectedPermissions.filter((id) => !modulePermissionIds.includes(id)),
      );
    }
  };

  // Check if all permissions in a module are selected
  const isModuleFullySelected = (moduleGroup: any) => {
    const modulePermissionIds = moduleGroup.permissions.map((p: any) => p._id);
    return modulePermissionIds.every((id: string) =>
      selectedPermissions.includes(id),
    );
  };

  const isModulePartiallySelected = (moduleGroup: any) => {
    const modulePermissionIds = moduleGroup.permissions.map((p: any) => p._id);
    const selectedCount = modulePermissionIds.filter((id: string) =>
      selectedPermissions.includes(id),
    ).length;
    return selectedCount > 0 && selectedCount < modulePermissionIds.length;
  };

  // Handle role change to filter users
  const handleRoleChange = (event: any) => {
    const roleId = event.target.value; 

    setSelectedRole(roleId);
    setSelectedUsers([]); // Reset user selection when role changes
  };

  // Handle user change
  const handleUserChange = (userIds: string[]) => {
    setSelectedUsers(userIds);
  };

  // Get users for dropdown based on selected role
  const getUsersForDropdown = () => {
    if (selectedRole) {
      const selectedRoleUser = roleUsers.find(
        (ru) => ru.role._id === selectedRole,
      );
      return selectedRoleUser ? selectedRoleUser.users : [];
    } else {
      return users;
    }
  };

  // Fetch users and roles
  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      try {
        const [usersResponse, roleUsersResponse] = await Promise.all([
          userService.getAll(),
          roleUserService.getAll(),
        ]);
        setUsers(usersResponse.data);
        setRoleUsers(roleUsersResponse.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsersAndRoles();
  }, [userService, roleUserService]);

  // Fetch permissions for display
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await permissionService.getAll({
          page: 1, 
        });
        setPermissions(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPermissions();
  }, [permissionService]);

  // Fetch user permissions with pagination
  const fetchUserPermissions = async () => {
    try {
      const response = await userPermissionUsersService.getAll({
        page: pagination.page, 
      });
      setData(response.data);
      pagination.setTotal(response.pagination.total);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [
    pagination.page,
    pagination.pageSize,
    pagination.searchText,
    pagination.setTotal,
    userPermissionService,
  ]); 
  return (
    <>
      <div className="w-full">
        <Breadcrumbs
          className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800"
          headTitle="Permission Management"
          items={[{ label: "User Permissions", path: "/user-permissions" }]}
        />
        <div className="flex justify-end mb-4 w-full">
          {hasPermission('User', 'create') && (
            <Button
              onClick={modalToggle}
              label={<PlusOutlined />}
              className="bg-blue-500"
              title="Assign User Permission"
            ></Button>
          )}
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-700">
          <div className="overflow-x-auto">
            <DataTable
              columns={[
                {
                  label: "User",
                  key: "user",
                  render: (item) => item.user?.name || "Unknown User",
                },
                // {
                //   label: "Permissions",
                //   key: "permissions",
                //   render: (item) => (
                //     <div className="space-y-2">
                //       {item.permissions?.map((module: any) => (
                //         <div
                //           key={module.module}
                //           className="border rounded p-3 bg-gray-50"
                //         >
                //           <div className="flex items-center mb-2">
                //             <h4 className="font-semibold text-gray-800">
                //               {module.module}
                //               {module.isHeading && (
                //                 <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                //                   Heading
                //                 </span>
                //               )}
                //             </h4>
                //           </div>
                //         </div>
                //       ))}
                //     </div>
                //   ),
                // },
                ...(hasActionPermissions ? [{
                  label: "Actions",
                  key: "actions",
                  render: (item: any) => (
                    <div className="flex justify-end space-x-0.5 min-w-[60px]">
                      {hasPermission('User', 'update') && (
                        <Button
                          onClick={() => handleEdit(item)}
                          label={<EditOutlined />}
                          className="bg-green-500 hover:bg-green-600 px-1 py-0.5 text-xs rounded w-6 h-6 flex items-center justify-center"
                          title="Edit User Permission"
                        />
                      )}
                      {hasPermission('User', 'delete') && (
                        <Button
                          onClick={() => handleDelete(item)}
                          label={<DeleteOutlined />}
                          className="bg-red-500 hover:bg-red-600 px-1 py-0.5 text-xs rounded w-6 h-6 flex items-center justify-center"
                          title="Remove User Permission"
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

        <Modal
          className="max-w-4xl"
          ref={modalRef}
          title={
            editingAssignment ? "Edit User Permissions" : "Assign Permissions"
          }
          isOpen={open}
          onClose={handleModalClose}
          onSave={handleSubmit}
          saveText={editingAssignment ? "Update" : "Save"}
          saveClassName={editingAssignment ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-400"}
        >
          <form onSubmit={handleSubmit}>
            <Select
              label="Select Role"
              options={[
                { label: "Select Role", value: "" },
                ...roleUsers.map((roleUser: any) => ({
                  label: roleUser.role.role,
                  value: roleUser.role._id,
                })),
              ]}
              value={selectedRole}
              onChange={handleRoleChange}
            />
            <MultiSelect
              label="Select Users (Optional)"
              options={getUsersForDropdown().map((user: any) => ({
                label: user.name,
                value: user._id,
              }))}
              value={selectedUsers}
              onChange={handleUserChange}
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Permissions
              </label>
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded p-3 bg-gray-50">
                {permissions
                  .reduce((acc: any[], permission: any) => {
                    const module = permission.module;
                    if (!acc.find((item) => item.module === module)) {
                      acc.push({
                        module,
                        isHeading: permission.isHeading,
                        permissions: permissions.filter(
                          (p) => p.module === module,
                        ),
                      });
                    }
                    return acc;
                  }, [])
                  .sort((a: any, b: any) => a.module.localeCompare(b.module))
                  .map((moduleGroup: any) => (
                    <div
                      key={moduleGroup.module}
                      className="border rounded p-3 bg-white"
                    >
                      <div className="flex items-center mb-2">
                        <Checkbox
                          id={`heading-${moduleGroup.module}`}
                          checked={isModuleFullySelected(moduleGroup)}
                          onChange={(checked) =>
                            handleHeadingChange(moduleGroup, checked)
                          }
                          indeterminate={isModulePartiallySelected(moduleGroup)}
                        />
                        <h4 className="font-semibold text-gray-800 ml-2">
                          {moduleGroup.module}
                          {moduleGroup.isHeading && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Heading
                            </span>
                          )}
                        </h4>
                      </div>
                      <div className="space-y-1 ml-6">
                        {moduleGroup.permissions.map((permission: any) => (
                          <div
                            key={permission._id}
                            className="flex items-center"
                          >
                            <Checkbox
                              id={permission._id}
                              label={permission.name}
                              checked={selectedPermissions.includes(
                                permission._id,
                              )}
                              onChange={(checked) =>
                                handlePermissionChange(permission._id, checked)
                              }
                            />
                            <span className="ml-2 text-sm text-gray-600">
                              {permission.description}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          className="max-w-md"
          title="Confirm Delete"
          isOpen={deleteConfirm.isOpen}
          onClose={cancelDelete}
          onSave={confirmDelete}
        >
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this permission assignment?
            </p>
            {deleteConfirm.assignment && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-semibold">
                  {deleteConfirm.assignment.user?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {deleteConfirm.assignment?.permissions?.length || 0}{" "}
                  permission(s) assigned
                </p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
};

export default UserPermissionAssignment;
