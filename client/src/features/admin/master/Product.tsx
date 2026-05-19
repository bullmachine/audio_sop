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
import { createProductSchema } from "../../../schemas/validation";
import ServiceFactory from "../../../services/serviceFactory";
import { useLoader } from "../../../shared/hooks/useLoader";
import { Textarea } from "../../../shared/component/Textarea";

interface Product {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

const Product: React.FC = () => {
  const { simulateAsync } = useLoader();
  const productService = ServiceFactory.productService;
  const [data, setData] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; item: Product | null }>({
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
    schema: createProductSchema(),
    onSubmit: async (formData: { name: string; description?: string }) => {
      if (editing) {
        return productService.update(editing._id, formData);
      }
      return productService.create(formData);
    },
    onSuccess: () => {
      toast.success(editing ? "Product updated" : "Product created");
      fetchData();
      setEditing(null);
    },
    onError: (error) => toast.error(error?.message || "Failed to save product"),
  });

  const { register, reset } = form;
  const { page, setPage, pageSize, searchText, setSearchText, setTotal, totalPages } =
    usePagination({ defaultPageSize: 10 });

  const fetchData = async (searchValue?: string) => {
    const response = await productService.getAll({
      page,
      limit: pageSize,
      search: searchValue !== undefined ? searchValue : searchText,
    });
    setData(response.data || []);
    setTotal(response.pagination?.total || 0);
  };

  const fetchDataWithLoader = async (searchValue?: string) => {
    await simulateAsync(() => fetchData(searchValue), "Loading products...", 800);
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

  const handleEdit = (item: Product) => {
    setEditing(item);
    reset({ name: item.name, description: item.description || "" });
    setOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.item) return;
    try {
      await productService.delete(deleteConfirm.item._id);
      toast.success("Product deleted");
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
        headTitle="KMAT Products"
        items={[{ label: "Products", path: "/product" }]}
      />

      <div className="flex justify-between items-center mb-4">
        <Input
          placeholder="Search products..."
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-md"
        />
        <Button
          onClick={() => {
            setEditing(null);
            reset({ name: "", description: "" });
            modalToggle();
          }}
          label={<PlusOutlined />}
          className="bg-blue-500 hover:bg-blue-600"
          title="Add Product"
        />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800">
        {!loading && data.length === 0 ? (
          <NoData title="No Products" message="Create your first KMAT product." className="py-8" />
        ) : (
          <>
            <DataTable
              columns={[
                {
                  label: "Product Name",
                  key: "name",
                  render: (item: Product) => (
                    <span className="font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                  ),
                },
                {
                  label: "Description",
                  key: "description",
                  render: (item: Product) => item.description || "-",
                },
                {
                  label: "Status",
                  key: "isActive",
                  render: (item: Product) => (
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  ),
                },
                {
                  label: "Actions",
                  key: "actions",
                  render: (item: Product) => (
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
        title={editing ? "Edit Product" : "Add Product"}
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
          <Input {...register("name")} label="Product Name" placeholder="e.g. KMAT-1" />
          <Textarea {...register("description")} label="Description" placeholder="Optional description" />
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Delete "${deleteConfirm.item?.name}"?`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Product;
