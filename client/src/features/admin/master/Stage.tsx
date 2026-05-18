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
import { createStageSchema } from "../../../schemas/validation"; 
import ServiceFactory from "../../../services/serviceFactory";
import { useLoader } from "../../../shared/hooks/useLoader";
import { usePermissions } from "../../../hooks/usePermissions";
import { Label } from "../../../shared/component/Label";
import { Textarea } from "../../../shared/component/Textarea";

interface Stage {
  _id: string;
  stage: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const Stage: React.FC = () => {
  const { simulateAsync } = useLoader();
  const { hasPermission } = usePermissions();
  const [data, setData] = useState<Stage[]>([]);
  const [editingProcess, setEditingProcess] = useState<Stage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; stage: Stage | null }>({
    isOpen: false,
    stage: null
  });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const stageService = ServiceFactory.stageService;

  const { 
    open, 
    setOpen, 
    loading, 
    modalRef, 
    modalToggle, 
    form, 
    handleSubmit 
  } = useModalForm({
    schema: createStageSchema(),
    onSubmit: async (data: { stage: string }) => {
      if (editingProcess) {
        // Update existing stage
        const response = await stageService.update(editingProcess._id, data);
        return response;
      } else {
        // Create new stage
        const response = await stageService.create(data);
        return response;
      }
    },
    onSuccess: (message) => {
      toast.success(message || (editingProcess ? "Stage updated successfully" : "Stage created successfully"));
      fetchData();
      setEditingProcess(null);
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to save stage");
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

  // Fetch data
  const fetchData = async (searchValue?: string) => {
    const response = await stageService.getAll({
      page: page,
      limit: pageSize,
      search: searchValue !== undefined ? searchValue : searchText
    });
    setData(response.data || []);
    setTotal(response.pagination?.total || 0);
  };

  // Fetch data with loader (for manual calls like pagination)
  const fetchDataWithLoader = async (searchValue?: string) => {
    await simulateAsync(
      async () => {
        await fetchData(searchValue);
      },
      "Loading Processes...",
      1500
    );
  };

  // Use common debounced search hook with immediate UI update and delayed API call
  const { updateSearchText, debouncedFetchData, cancelPendingCalls } = useDebouncedSearch(setSearchText, fetchData, 500);

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    updateSearchText(value); // Immediate UI update
    
    // If search is cleared, cancel pending calls and fetch all data immediately
    if (value.trim() === '') {
      cancelPendingCalls(); // Cancel any pending debounced calls
      fetchDataWithLoader(''); // Immediate fetch with empty string
    } else {
      debouncedFetchData(value);   // Debounced API call with current search value
    }
  };

  // Handle edit
  const handleEdit = (stage: Stage) => {
    setEditingProcess(stage);
    reset({
      stage: stage.stage
    });
    setOpen(true);
  };

  // Handle delete
  const handleDelete = (stage: Stage) => {
    setDeleteConfirm({
      isOpen: true,
      stage
    });
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (deleteConfirm.stage) {
      try {
        await stageService.delete(deleteConfirm.stage._id);
        toast.success('Stage deleted successfully');
        fetchData();
      } catch (error: any) {
        toast.error(error?.message || 'Failed to delete stage');
        console.error('Error deleting stage:', error);
      }
      setDeleteConfirm({ isOpen: false, stage: null });
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    await simulateAsync(
      async () => {
        const formData = new FormData();
        formData.append('file', file);

        const result = await apiRequest.post<any>('/process/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (result.success) {
          setUploadResults(result.data);
          toast.success(`Excel file processed successfully! ${result.data.successful} processes created.`);
          fetchData();
          // Close modal after successful upload
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

  // Download template
  const downloadTemplate = async () => {
    await simulateAsync(
      async () => {
        const response = await apiRequest.get<Blob>('/process/template/download', {
          responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'process_template.xlsx';
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
          headTitle="Stage"
           items={[{ label: "Stage", path: "/stage" }]}
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
              label={<PlusOutlined /> }
              className="bg-blue-500 hover:bg-blue-600" 
              title="Add New Stage"
            />
             
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Search processes..."
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:shadow-gray-700">
          <div className="overflow-x-auto">
            {!loading && data.length === 0 ? (
              <NoData 
                title="No Processes Found"
                message="There are no processes to display. Create your first process to get started."
                className="py-8"
              />
            ) : (
              <>
                <DataTable
                  columns={[
                    {
                      label: "Stage Name",
                      key: "stage",
                      render: (item: Stage) => (
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {item.stage || '-'}
                        </span>
                      ),
                    },
                    {
                      label: "Status",
                      key: "isActive",
                      render: (item: Stage) => (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      ),
                    },
                    // {
                    //   label: "Created At",
                    //   key: "createdAt",
                    //   render: (item: Stage) => new Date(item.createdAt).toLocaleDateString(),
                    // },
                    {
                      label: "Actions",
                      key: "actions",
                      render: (item: Stage) => (
                        <div className="flex justify-start space-x-0.5 min-w-[60px]">
                          {hasPermission('process', 'edit') && (
                            <Button
                              onClick={() => handleEdit(item)}
                              label={<EditOutlined />}
                              className="bg-yellow-500 hover:bg-yellow-600 px-1 py-0.5 text-xs rounded w-6 h-6 flex items-center justify-center"
                              title="Edit Stage"
                            />
                          )}
                          {hasPermission('process', 'delete') && (
                            <Button
                              onClick={() => handleDelete(item)}
                              label={<DeleteOutlined />}
                              className="bg-red-500 hover:bg-red-600 px-1 py-0.5 text-xs rounded w-6 h-6 flex items-center justify-center"
                              title="Delete Stage"
                            />
                          )}
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

      {/* Add/Edit Modal */}
      <Modal
        ref={modalRef}
        className="max-w-lg"
        title={editingProcess ? "Edit Stage" : "Add Stage"}
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setEditingProcess(null);
          reset();
        }}
        onSave={handleSubmit}
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              {...register("stage")}
              id="stage"
              placeholder="Enter stage name" 
              label="Stage Name"
              className={form.formState.errors.stage ? "border-red-500" : ""}
              />
                  {form.formState.errors.stage && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.stage.message}
                    </p>
                 )}
          </div>
          <div className="mb-4">
            <Textarea
              {...register("stage_description")}
              id="stage_description"
              placeholder="Enter stage description" 
              label="Stage Description"
              className={form.formState.errors.stage_description ? "border-red-500" : ""}
              />
                  {form.formState.errors.stage_description && (
                    <p className="text-red-500 text-xs mt-1">
                      {form.formState.errors.stage_description.message}
                    </p>
                 )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, stage: null })}
        onConfirm={confirmDelete}
        title="Delete Stage"
        message={`Are you sure you want to delete "${deleteConfirm.stage?.stage}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {/* Upload Modal */}
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
      </div>
    </>
  );
};

export default Stage;
