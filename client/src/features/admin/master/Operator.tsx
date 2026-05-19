import React, { useEffect, useState } from "react";
import { Button } from "../../../shared/component/Button";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Modal from "../../../shared/component/Modal";
import ConfirmModal from "../../../shared/component/ConfirmModal";
import Breadcrumbs from "../../../shared/component/Breadcrumbs";
import { toast } from "react-toastify";
import PaginationControls from "../../../shared/component/table/PaginationControls";
import DataTable from "../../../shared/component/table/DataTable";
import { Input } from "../../../shared/component/Input";
import NoData from "../../../shared/component/NoData";
import { useModalForm } from "../../../hooks/useModalForm";
import { usePagination } from "../../../hooks/usePagination";
import { useDebouncedSearch } from "../../../hooks/useDebounce";
import { createOperatorSchema } from "../../../schemas/validation";
import ServiceFactory from "../../../services/serviceFactory";
import { useLoader } from "../../../shared/hooks/useLoader";

interface Operator {
  _id: string;
  name: string;
  empCode: string;
  isDeleted: boolean;
  createdAt: string;
}

const OperatorPage: React.FC = () => {
  const { simulateAsync } = useLoader();
  const operatorService = ServiceFactory.operatorService;
  const [data, setData] = useState<Operator[]>([]);
  const [editing, setEditing] = useState<Operator | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; item: Operator | null }>({
    isOpen: false,
    item: null,
  });

  const {
    open,
    setOpen,
    loading,
    modalRef,
    modalToggle,
    form,
    handleSubmit,
  } = useModalForm({
    schema: createOperatorSchema(!!editing),
    onSubmit: async (formData: { name: string; loginId: string; password?: string }) => {
      const payload = {
        name: formData.name,
        loginId: formData.loginId,
        ...(formData.password ? { password: formData.password } : {}),
      };
      if (editing) {
        return operatorService.update(editing._id, payload);
      }
      return operatorService.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Operator updated" : "Operator created");
      fetchData();
      setEditing(null);
    },
    onError: (error) => toast.error(error?.message || "Failed to save operator"),
  });

  const { register, reset } = form;
  const { page, setPage, pageSize, searchText, setSearchText, setTotal, totalPages } =
    usePagination({ defaultPageSize: 10 });

  const fetchData = async (searchValue?: string) => {
    const response = await operatorService.getAll({
      page,
      limit: pageSize,
      search: searchValue !== undefined ? searchValue : searchText,
    });
    setData(response.data || []);
    setTotal(response.pagination?.total || 0);
  };

  const fetchDataWithLoader = async (searchValue?: string) => {
    await simulateAsync(() => fetchData(searchValue), "Loading operators...", 800);
  };

  const { updateSearchText, debouncedFetchData, cancelPendingCalls } = useDebouncedSearch(
    setSearchText,
    fetchData,
    500
  );

  const handleSearchChange = (value: string) => {
    updateSearchText(value);
    if (value.trim() === "") {
      cancelPendingCalls();
      fetchDataWithLoader("");
    } else {
      debouncedFetchData(value);
    }
  };

  const handleEdit = (item: Operator) => {
    setEditing(item);
    reset({ name: item.name, loginId: item.empCode, password: "" });
    setOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.item) return;
    try {
      await operatorService.delete(deleteConfirm.item._id);
      toast.success("Operator deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete");
    }
    setDeleteConfirm({ isOpen: false, item: null });
  };

  useEffect(() => {
    fetchDataWithLoader();
  }, [page, pageSize]);

  return (
    <div className="w-full">
      <Breadcrumbs
        className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800"
        headTitle="Operators"
        items={[{ label: "Operators", path: "/operator" }]}
      />

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search operators..."
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-md"
        />
        <Button
          onClick={() => {
            setEditing(null);
            reset({ name: "", loginId: "", password: "" });
            modalToggle();
          }}
          label={<PlusOutlined />}
          className="bg-blue-500 hover:bg-blue-600"
          title="Add Operator"
        />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800">
        {!loading && data.length === 0 ? (
          <NoData title="No Operators" message="Create operators to assign audio files." className="py-8" />
        ) : (
          <>
            <DataTable
              columns={[
                {
                  label: "Name",
                  key: "name",
                  render: (item: Operator) => (
                    <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                  ),
                },
                {
                  label: "Login ID",
                  key: "empCode",
                  render: (item: Operator) => item.empCode,
                },
                {
                  label: "Actions",
                  key: "actions",
                  render: (item: Operator) => (
                    <div className="flex gap-1">
                      <Button
                        onClick={() => handleEdit(item)}
                        label={<EditOutlined />}
                        className="bg-yellow-500 hover:bg-yellow-600 text-xs rounded w-6 h-6 flex items-center justify-center"
                        title="Edit"
                      />
                      <Button
                        onClick={() => setDeleteConfirm({ isOpen: true, item })}
                        label={<DeleteOutlined />}
                        className="bg-red-500 hover:bg-red-600 text-xs rounded w-6 h-6 flex items-center justify-center"
                        title="Delete"
                      />
                    </div>
                  ),
                },
              ]}
              data={data}
              loading={loading}
              rowKey="_id"
            />
            <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>

      <Modal
        ref={modalRef}
        title={editing ? "Edit Operator" : "Add Operator"}
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
          reset();
        }}
        onSave={handleSubmit}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input {...register("name")} label="Operator Name" placeholder="Enter name" />
          <Input {...register("loginId")} label="Login ID" placeholder="e.g. OP001" />
          <Input
            {...register("password")}
            label={editing ? "New Password (optional)" : "Password"}
            placeholder="Minimum 6 characters"
            isPassword
          />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title="Delete Operator"
        message={`Delete operator "${deleteConfirm.item?.name}"?`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default OperatorPage;
