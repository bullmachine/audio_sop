import React, { useEffect, useRef, useState } from "react";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  HolderOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { Button } from "../../../shared/component/Button";
import Modal from "../../../shared/component/Modal";
import ConfirmModal from "../../../shared/component/ConfirmModal";
import Breadcrumbs from "../../../shared/component/Breadcrumbs";
import { toast } from "react-toastify";
import PaginationControls from "../../../shared/component/table/PaginationControls";
import DataTable from "../../../shared/component/table/DataTable";
import { Input } from "../../../shared/component/Input";
import NoData from "../../../shared/component/NoData";
import { Select } from "../../../shared/component/Select";
import MultiSelect from "../../../shared/component/MultiSelect";
import ServiceFactory from "../../../services/serviceFactory";
import type { AudioSop, AudioFileItem } from "../../../services/audioSopService";
import { useLoader } from "../../../shared/hooks/useLoader";
import { usePagination } from "../../../hooks/usePagination";
import { useDebouncedSearch } from "../../../hooks/useDebounce";

type FileEntry = {
  id: string;
  name: string;
  file?: File;
  existing?: AudioFileItem;
};

const getRefName = (ref: string | { _id: string; name?: string; stage?: string; language?: string }) => {
  if (typeof ref === "string") return ref;
  return ref.name || ref.stage || ref.language || ref._id;
};

const AudioFile: React.FC = () => {
  const { simulateAsync } = useLoader();
  const [data, setData] = useState<AudioSop[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AudioSop | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; item: AudioSop | null }>({
    isOpen: false,
    item: null,
  });

  const audioSopService = ServiceFactory.audioSopService;
  const [products, setProducts] = useState<{ label: string; value: string }[]>([]);
  const [stages, setStages] = useState<{ label: string; value: string }[]>([]);
  const [languages, setLanguages] = useState<{ label: string; value: string }[]>([]);
  const [operators, setOperators] = useState<{ label: string; value: string }[]>([]);

  const [form, setForm] = useState({
    product: "",
    stage: "",
    language: "",
    sopName: "",
    operators: [] as string[],
  });
  const [fileEntries, setFileEntries] = useState<FileEntry[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { page, setPage, pageSize, searchText, setSearchText, setTotal, totalPages } =
    usePagination({ defaultPageSize: 10 });

  const fetchMasters = async () => {
    const [productRes, stageRes, langRes, opRes] = await Promise.all([
      ServiceFactory.productService.getAll({ page: 1, limit: 100 }),
      ServiceFactory.stageService.getAll({ page: 1, limit: 100 }),
      ServiceFactory.languageService.getAll({ page: 1, limit: 100 }),
      ServiceFactory.operatorService.getAll({ page: 1, limit: 100 }),
    ]);

    setProducts((productRes.data || []).map((p: any) => ({ label: p.name, value: p._id })));
    setStages((stageRes.data || []).map((s: any) => ({ label: s.stage, value: s._id })));
    setLanguages((langRes.data || []).map((l: any) => ({ label: l.language, value: l._id })));
    setOperators(
      (opRes.data || []).map((o: any) => ({ label: `${o.name} (${o.empCode})`, value: o._id }))
    );
  };

  const fetchData = async (searchValue?: string) => {
    const response = await audioSopService.getAll({
      page,
      limit: pageSize,
      search: searchValue !== undefined ? searchValue : searchText,
    });
    setData(response.data || []);
    setTotal(response.pagination?.total || 0);
  };

  const fetchDataWithLoader = async (searchValue?: string) => {
    setLoading(true);
    await simulateAsync(() => fetchData(searchValue), "Loading audio assignments...", 800);
    setLoading(false);
  };

  const { updateSearchText, debouncedFetchData, cancelPendingCalls } = useDebouncedSearch(
    setSearchText,
    fetchData,
    500
  );

  const resetForm = () => {
    setForm({ product: "", stage: "", language: "", sopName: "", operators: [] });
    setFileEntries([]);
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item: AudioSop) => {
    setEditing(item);
    setForm({
      product: typeof item.product === "string" ? item.product : item.product._id,
      stage: typeof item.stage === "string" ? item.stage : item.stage._id,
      language: typeof item.language === "string" ? item.language : item.language._id,
      sopName: item.sopName,
      operators: item.operators.map((o) => o._id),
    });
    setFileEntries(
      item.files.map((f) => ({
        id: f._id || f.fileName,
        name: f.originalName,
        existing: f,
      }))
    );
    setModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newEntries = files.map((file, i) => ({
      id: `new-${Date.now()}-${i}`,
      name: file.name,
      file,
    }));
    setFileEntries((prev) => [...prev, ...newEntries]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id: string) => {
    setFileEntries((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setFileEntries((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    setDragIndex(index);
  };

  const handleSave = async () => {
    if (!form.product || !form.stage || !form.language || !form.sopName.trim()) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!form.operators.length) {
      toast.error("Select at least one operator");
      return;
    }
    if (!fileEntries.length) {
      toast.error("Add at least one audio file");
      return;
    }

    setSaving(true);
    try {
      const newFiles = fileEntries.filter((f) => f.file).map((f) => f.file!);
      const fileOrder: Record<string, number> = {};
      fileEntries.forEach((entry, index) => {
        if (entry.file) {
          fileOrder[entry.file.name] = index;
        }
      });

      const existingOrder: Record<string, number> = {};
      fileEntries.forEach((entry, index) => {
        if (entry.existing?._id) {
          existingOrder[entry.existing._id] = index;
        }
      });

      if (editing) {
        const removedFileIds = editing.files
          .filter((ef) => !fileEntries.some((fe) => fe.existing?._id === ef._id))
          .map((f) => f._id!)
          .filter(Boolean);

        await audioSopService.updateWithFiles(editing._id, {
          ...form,
          audioFiles: newFiles,
          fileOrder: existingOrder,
          removedFileIds,
        });
        toast.success("Audio assignment updated");
      } else {
        await audioSopService.createWithFiles({
          ...form,
          audioFiles: newFiles,
          fileOrder,
        });
        toast.success("Audio files assigned successfully");
      }

      setModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.item) return;
    try {
      await audioSopService.delete(deleteConfirm.item._id);
      toast.success("Assignment deleted");
      fetchData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete");
    }
    setDeleteConfirm({ isOpen: false, item: null });
  };

  useEffect(() => {
    fetchMasters();
    fetchDataWithLoader();
  }, [page, pageSize]);

  return (
    <div className="w-full">
      <Breadcrumbs
        className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800"
        headTitle="Audio File Management"
        items={[{ label: "Audio Files", path: "/audio-files" }]}
      />

      <div className="flex justify-between items-center mb-4 gap-4">
        <Input
          placeholder="Search SOP assignments..."
          value={searchText}
          onChange={(e) => {
            updateSearchText(e.target.value);
            if (e.target.value.trim() === "") {
              cancelPendingCalls();
              fetchDataWithLoader("");
            } else {
              debouncedFetchData(e.target.value);
            }
          }}
          className="max-w-md"
        />
        <Button
          onClick={openCreate}
          label={<PlusOutlined />}
          className="bg-blue-500 hover:bg-blue-600"
          title="Assign Audio Files"
        />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden dark:bg-gray-800">
        {!loading && data.length === 0 ? (
          <NoData
            title="No Audio Assignments"
            message="Upload and assign audio SOP files to operators."
            className="py-8"
          />
        ) : (
          <>
            <DataTable
              columns={[
                {
                  label: "SOP Name",
                  key: "sopName",
                  render: (item: AudioSop) => (
                    <span className="font-medium text-gray-900 dark:text-gray-100">{item.sopName}</span>
                  ),
                },
                {
                  label: "Product",
                  key: "product",
                  render: (item: AudioSop) => getRefName(item.product),
                },
                {
                  label: "Stage",
                  key: "stage",
                  render: (item: AudioSop) => getRefName(item.stage),
                },
                {
                  label: "Language",
                  key: "language",
                  render: (item: AudioSop) => getRefName(item.language),
                },
                {
                  label: "Files",
                  key: "files",
                  render: (item: AudioSop) => `${item.files.length} file(s)`,
                },
                {
                  label: "Operators",
                  key: "operators",
                  render: (item: AudioSop) => item.operators.map((o) => o.name).join(", "),
                },
                {
                  label: "Actions",
                  key: "actions",
                  render: (item: AudioSop) => (
                    <div className="flex gap-1">
                      <Button
                        onClick={() => openEdit(item)}
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
        title={editing ? "Edit Audio Assignment" : "Assign Audio Files"}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        onSave={handleSave}
        saveText={saving ? "Saving..." : "Save & Assign"}
        className="max-w-2xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <Select
            label="KMAT Product"
            options={[{ label: "Select product", value: "" }, ...products]}
            value={form.product}
            onChange={(e) => setForm((f) => ({ ...f, product: e.target.value }))}
            searchable
          />
          <Select
            label="Stage (single select)"
            options={[{ label: "Select stage", value: "" }, ...stages]}
            value={form.stage}
            onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value }))}
            searchable
          />
          <Select
            label="Language"
            options={[{ label: "Select language", value: "" }, ...languages]}
            value={form.language}
            onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
            searchable
          />
          <MultiSelect
            label="Operators"
            options={operators}
            value={form.operators}
            onChange={(values) => setForm((f) => ({ ...f, operators: values }))}
            placeholder="Select one or more operators..."
          />
          <Input
            label="SOP Name"
            placeholder="Enter SOP name"
            value={form.sopName}
            onChange={(e) => setForm((f) => ({ ...f, sopName: e.target.value }))}
          />

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Audio Files</label>
            <div
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <UploadOutlined className="text-2xl text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Click to upload audio files (mp3, wav, ogg, m4a)
              </p>
            </div>
          </div>

          {fileEntries.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <HolderOutlined /> Drag to reorder files
              </p>
              {fileEntries.map((entry, index) => (
                <div
                  key={entry.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={() => setDragIndex(null)}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 cursor-grab active:cursor-grabbing"
                >
                  <span className="text-gray-400 font-mono text-sm w-6">{index + 1}</span>
                  <HolderOutlined className="text-gray-400" />
                  <SoundOutlined className="text-blue-500" />
                  <span className="flex-1 text-sm truncate">{entry.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(entry.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title="Delete Assignment"
        message={`Delete "${deleteConfirm.item?.sopName}" and all associated files?`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default AudioFile;
