import { apiRequest } from './axios';
import type { PaginationParams, PaginatedResponse } from '../types/common';

export interface Tracking {
  _id?: string;
  user_id: string;
  operator_id?: string;
  emp_code: string;
  user_name: string;
  tracking_type: 'login' | 'audio_playback';
  // Login-specific fields
  login_time?: string;
  logout_time?: string;
  session_duration?: number;
  // Audio playback-specific fields
  audio_sop_id?: string;
  audio_file_id?: string;
  product_id?: string;
  stage_id?: string;
  language_id?: string;
  cycle_number?: number;
  machine_number?: string;
  audio_start_time?: string;
  audio_end_time?: string;
  audio_duration?: number;
  playback_status?: 'playing' | 'paused' | 'completed' | 'interrupted';
  completion_percentage?: number;
  playback_speed?: number;
  // Common fields
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  status: 'active' | 'completed' | 'terminated';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TrackingStats {
  bySOP?: Array<{
    audio_sop_id: string;
    sop_title: string;
    totalCycles: number;
    completedCycles: number;
    totalDuration: number;
    avgCompletionPercentage: number;
    lastPlayed: string;
  }>;
  overall?: {
    totalSessions: number;
    completedSessions: number;
    totalDuration: number;
    avgDuration: number;
  };
  login?: {
    totalLogins: number;
    completedLogins: number;
    totalSessionDuration: number;
    avgSessionDuration: number;
  };
}

class TrackingService {
  private endpoint = '/tracking';

  // Create tracking record (login or audio playback)
  async createTracking(data: {
    tracking_type: 'login' | 'audio_playback';
    emp_code: string;
    user_name: string;
    operator_id?: string;
    audio_sop_id?: string;
    audio_file_id?: string;
    product_id?: string;
    stage_id?: string;
    language_id?: string;
    machine_number?: string;
  }): Promise<{ message: string; data: Tracking }> {
    return apiRequest.post(this.endpoint, data);
  }

  // Update tracking record
  async updateTracking(trackingId: string, data: {
    update_type?: 'login' | 'audio_playback';
    status?: 'active' | 'completed' | 'terminated' | 'playing' | 'paused' | 'interrupted';
    completion_percentage?: number;
    playback_speed?: number;
    audio_duration?: number;
    notes?: string;
  }): Promise<{ message: string; data: Tracking }> {
    return apiRequest.put(`${this.endpoint}/${trackingId}`, data);
  }

  // Get active tracking records for an operator
  async getActiveTracking(operatorId: string, trackingType?: 'login' | 'audio_playback'): Promise<{ data: Tracking[] }> {
    const params = trackingType ? { tracking_type: trackingType } : {};
    return apiRequest.get(`${this.endpoint}/active/${operatorId}`, { params });
  }

  // Get tracking records with pagination and filters
  async getTracking(params?: PaginationParams & {
    user_id?: string;
    operator_id?: string;
    tracking_type?: 'login' | 'audio_playback';
    status?: string;
    audio_sop_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<PaginatedResponse<Tracking>> {
    return apiRequest.get(this.endpoint, { params });
  }

  // Get tracking statistics
  async getTrackingStats(params: {
    user_id: string;
    tracking_type?: 'login' | 'audio_playback';
    start_date?: string;
    end_date?: string;
  }): Promise<{ data: TrackingStats }> {
    return apiRequest.get(`${this.endpoint}/stats`, { params });
  }

  // Get employee date-wise analysis
  async getEmployeeDateWiseAnalysis(params: {
    start_date?: string;
    end_date?: string;
    emp_code?: string;
    machine_number?: string;
  }): Promise<{ data: { dateWise: any[]; summary: any[] } }> {
    return apiRequest.get(`${this.endpoint}/employee-date-wise-analysis`, { params });
  }
}

export default new TrackingService();
