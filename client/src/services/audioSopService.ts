import { GenericCrudService } from "./genericCrud";
import { apiRequest } from "./axios";
import type { PaginationParams, PaginatedResponse } from "../types/common";

export interface AudioFileItem {
  _id?: string;
  fileName: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  size: number;
  order: number;
}

export interface AudioSop {
  _id: string;
  product: { _id: string; name: string } | string;
  stage: { _id: string; stage: string } | string;
  language: { _id: string; language: string } | string;
  sopName: string;
  operators: Array<{ _id: string; name: string; empCode: string }>;
  files: AudioFileItem[];
  isActive: boolean;
  createdAt: string;
}

export interface AudioSopFormData {
  product: string;
  stage: string;
  language: string;
  sopName: string;
  operators: string[];
  audioFiles: File[];
  fileOrder?: Record<string, number>;
  removedFileIds?: string[];
}

class AudioSopService extends GenericCrudService<AudioSop> {
  private readonly basePath = "/audio-sop";

  constructor() {
    super("/audio-sop");
  }

  async getActive(params?: PaginationParams): Promise<PaginatedResponse<AudioSop>> {
    return apiRequest.get(`${this.basePath}/active`, { params });
  }

  async getMyAssignments(params?: Record<string, string>): Promise<{ success: boolean; data: AudioSop[] }> {
    return apiRequest.get(`${this.basePath}/my-assignments`, { params });
  }

  async createWithFiles(data: AudioSopFormData): Promise<{ success: boolean; data: AudioSop; message: string }> {
    const formData = this.buildFormData(data);
    return apiRequest.post(this.basePath, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  async updateWithFiles(
    id: string,
    data: Partial<AudioSopFormData>
  ): Promise<{ success: boolean; data: AudioSop; message: string }> {
    const formData = this.buildFormData(data);
    return apiRequest.put(`${this.basePath}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  private buildFormData(data: Partial<AudioSopFormData>): FormData {
    const formData = new FormData();

    if (data.product) formData.append("product", data.product);
    if (data.stage) formData.append("stage", data.stage);
    if (data.language) formData.append("language", data.language);
    if (data.sopName) formData.append("sopName", data.sopName);
    if (data.operators) formData.append("operators", JSON.stringify(data.operators));
    if (data.fileOrder) formData.append("fileOrder", JSON.stringify(data.fileOrder));
    if (data.removedFileIds) formData.append("removedFileIds", JSON.stringify(data.removedFileIds));

    data.audioFiles?.forEach((file) => {
      formData.append("audioFiles", file);
    });

    return formData;
  }
}

export const audioSopService = new AudioSopService();
export default audioSopService;
