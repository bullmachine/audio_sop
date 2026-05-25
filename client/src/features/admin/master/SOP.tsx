import React, { useEffect, useState } from "react";
import { Button } from "../../../shared/component/Button";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import Modal from "../../../shared/component/Modal";
import ConfirmModal from "../../../shared/component/ConfirmModal";
import Breadcrumbs from "../../../shared/component/Breadcrumbs";
import { toast } from "react-toastify";
import { apiRequest } from "../../../services/axios";
import PaginationControls from "../../../shared/component/table/PaginationControls";
import DataTable from "../../../shared/component/table/DataTable";
import { Input } from "../../../shared/component/Input";
import NoData from "../../../shared/component/NoData";
import { useModalForm } from "../../../hooks/useModalForm";
import { usePagination } from "../../../hooks/usePagination";
import { useDebouncedSearch } from "../../../hooks/useDebounce";
import { createSopSchema } from "../../../schemas/validation";
import ServiceFactory from "../../../services/serviceFactory";
import { useLoader } from "../../../shared/hooks/useLoader";
import { Label } from "../../../shared/component/Label";
import { Textarea } from "../../../shared/component/Textarea";

interface SOP {
  _id: string;
  sop_name: string;
  sop_description?: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const SOPComponent: React.FC = () => {
  const { simulateAsync } = useLoader();
  const [data, setData] = useState<SOP[]>([]);
  const [editingSOP, setEditingSOP] = useState<SOP | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; sop: SOP | null }>({
    isOpen: false,
    sop: null
  });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const sopService = ServiceFactory.sopService;

  const {
    open,
    setOpen,
    loading,
    modalRef,
    modalToggle,
    form,
    handleSubmit
  } = useModalForm({
    schema: createSopSchema(),
    onSubmit: async (data: { sop_name: string; sop_description?: string }) => {
      if (editingSOP) {
        const response = await sopService.update(editingSOP._id, data);
        return response;
      } else {
        const response = await sopService.create(data);
        return response;
      }
    },
    onSuccess: (message) => {
      toast.success(message || (editingSOP ? "SOP updated successfully" : "SOP created successfully"));
      fetchData();
      setEditingSOP(null);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to save SOP");
      console.error("Save error:", error);
    },
  });

  const { register, reset } = form;

  const {
    page,
    setPage,
    pageSize,
    searchText,
    setSearchText,
    setTotal,
    totalPages,
  } = usePagination({ defaultPageSize: 10 });

  const fetchData = async (searchValue?: string) => {
    const response = await sopService.getAll({
      page: page,
      limit: pageSize,
      search: searchValue !== undefined ? searchValue : searchText
    });
    setData(response.data || []);
    setTotal(response.pagination?.total || 0);
  };

  const fetchDataWithLoader = async (searchValue?: string) => {
    await simulateAsync(
      async () => {
        await fetchData(searchValue);
      },
      "Loading SOPs...",
      1500
    );
  };

  const { updateSearchText, debouncedFetchData, cancelPendingCalls } = useDebouncedSearch(setSearchText, fetchData, 500);

  const handleSearchChange = (value: string) => {
    updateSearchText(value);
    if (value.trim() === '') {
      cancelPendingCalls();
      fetchDataWithLoader('');
    } else {
      debouncedFetchData(value);
    }
  };

  const handleEdit = (sop: SOP) => {
    setEditingSOP(sop);
    reset({
      sop_name: sop.sop_name,
      sop_description: sop.sop_description
    });
    setOpen(true);
  };

  const handleDelete = (sop: SOP) => {
    setDeleteConfirm({
      isOpen: true,
      sop
    });
  };

  const confirmDelete = async () => {
    if (deleteConfirm.sop) {
      try {
        await sopService.delete(deleteConfirm.sop._id);
        toast.success('SOP deleted successfully');
        fetchData();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete SOP');
        console.error('Error deleting SOP:', error);
      }
      setDeleteConfirm({ isOpen: false, sop: null });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    await simulateAsync(
      async () => {
        const formData = new FormData();
        formData.append('file', file);

        const result = await apiRequest.post<any>('/sop/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (result.success) {
          setUploadResults(result.data);
          toast.success(`Excel file processed successfully! ${result.data.successful} SOPs created.`);
          fetchData();
          setTimeout(() => {
            setUploadModalOpen(false);
            setUploadResults(null);
          }, 2000);
        } else {
          toast.error(result.message || 'Failed to process Excel file');
        }
      },
      "Uploading file...",
      1500
    );
  };

  const downloadTemplate = async () => {
    await simulateAsync(
      async () => {
        const response = await apiRequest.get<Blob>('/sop/template/download', {
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sop_template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Template downloaded successfully');
      },
      "Downloading template...",
      1000
    );
  };

  useEffect(() => {
    fetchDataWithLoader();
  }, [page, pageSize]);

  return (
    <>
      <div className="w-full">
        <Breadcrumbs
          className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800"
          headTitle="SOP"
          items={[{ label: "SOP", path: "/sop" }]}
        />
        <div className="flex justify-between items-center mb-4 w-full">
          <div className="flex gap-2">
            <Button
              onClick={downloadTemplate}
              label={<DownloadOutlined />}
              className="bg-green-500 hover:bg-green-600"
              title="Download Excel Template"
            />
            <Button
              onClick={() => {
                setUploadModalOpen(true);
                setTimeout(() => fileInputRef.current?.click(), 100);
              }}
              label={<UploadOutlined />}
              className="bg-purple-500 hover:bg-purple-600"
              title="Upload Excel File"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={modalToggle}
              label={<PlusOutlined />}
              className="bg-blue-500 hover:bg-blue-600"
              title="Add New SOP"
            />
          </div>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Search SOPs..."
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-700">
          <div className="overflow-x-auto">
            {!loading && data.length === 0 ? (
              <NoData
                title="No SOPs Found"
                message="There are no SOPs to display. Create your first SOP to get started."
                className="py-8"
              />
            ) : (
              <>
                <DataTable
                  columns={[
                    {
                      label: "SOP Name",
                      key: "sop_name",
                      render: (item: SOP) => (
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {item.sop_name || '-'}
                        </span>
                      ),
                    },
                    {
                      label: "Description",
                      key: "sop_description",
                      render: (item: SOP) => (
                        <span className="text-gray-600 dark:text-gray-400">
                          {item.sop_description || '-'}
                        </span>
                      ),
                    },
                    {
                      label: "Status",
                      key: "isActive",
                      render: (item: SOP) => (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      ),
                    },
                    {
                      label: "Actions",
                      key: "actions",
                      render: (item: SOP) => (
                        <div className="flex justify-start space-x-0.5 min-w-[60px]">
                          <Button
                            onClick={() => handleEdit(item)}
                            label={<EditOutlined />}
                            className="bg-yellow-500 hover:bg-yellow-600 px-1 py-0.5 text-xs rounded w-6 h-6 flex items-center justify-center"
                            title="Edit SOP"
                          />
                          <Button
                            onClick={() => handleDelete(item)}
                            label={<DeleteOutlined />}
                            className="bg-red-500 hover:bg-red-600 px-1 py-0.5 text-xs rounded w-6 h-6 flex items-center justify-center"
                            title="Delete SOP"
                          />
                        </div>
                      ),
                    },
                  ]}
                  data={data}
                  loading={loading}
                  rowKey="_id"
                  skeletonRowCount={8}
                />

                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        ref={modalRef}
        className="max-w-lg"
        title={editingSOP ? "Edit SOP" : "Add SOP"}
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setEditingSOP(null);
          reset();
        }}
        onSave={handleSubmit}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              {...register("sop_name")}
              id="sop_name"
              placeholder="Enter SOP name"
              label="SOP Name"
              className={form.formState.errors.sop_name ? "border-red-500" : ""}
            />
            {form.formState.errors.sop_name && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.sop_name.message}
              </p>
            )}
          </div>
          <div className="mb-4">
            <Textarea
              {...register("sop_description")}
              id="sop_description"
              placeholder="Enter SOP description"
              label="SOP Description"
              className={form.formState.errors.sop_description ? "border-red-500" : ""}
              rows={3}
            />
            {form.formState.errors.sop_description && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.sop_description.message}
              </p>
            )}
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, sop: null })}
        onConfirm={confirmDelete}
        title="Delete SOP"
        message={`Are you sure you want to delete "${deleteConfirm.sop?.sop_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      <Modal
        title="Upload Excel File"
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setUploadResults(null);
        }}
        onSave={() => setUploadModalOpen(false)}
        saveText="Close"
        saveClassName="bg-gray-500 hover:bg-gray-600"
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div>
            <Label label="Upload Excel File">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="hidden"
                />
                <div className="space-y-2">
                  <div className="text-gray-400">
                    <UploadOutlined className="text-4xl" />
                  </div>
                  <p className="text-sm text-gray-600">
                    Click to browse or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported formats: .xlsx, .xls (Max size: 5MB)
                  </p>
                </div>
              </div>
            </Label>
          </div>

          {uploadResults && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Upload Results</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Total Rows:</strong> {uploadResults.summary.totalRows}</p>
                <p><strong>Successful:</strong> {uploadResults.summary.successful}</p>
                <p><strong>Duplicates:</strong> {uploadResults.summary.duplicates}</p>
                <p><strong>Errors:</strong> {uploadResults.summary.errors}</p>
                {uploadResults.errors && uploadResults.errors.length > 0 && (
                  <div>
                    <h4 className="font-semibold mt-4 mb-2">Details:</h4>
                    <ul className="list-disc list-inside text-red-600">
                      {uploadResults.errors.map((error: any, index: number) => (
                        <li key={index}>{error.row}: {error.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default SOPComponent;
