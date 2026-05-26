import mongoose, { Schema, Document } from 'mongoose';

export interface ITracking extends Document {
  user_id: mongoose.Types.ObjectId;
  operator_id?: string;
  emp_code: string;
  user_name: string;
  tracking_type: 'login' | 'audio_playback';
  // Login-specific fields
  login_time?: Date;
  logout_time?: Date;
  session_duration?: number; // in seconds
  // Audio playback-specific fields
  audio_sop_id?: mongoose.Types.ObjectId;
  audio_file_id?: mongoose.Types.ObjectId;
  product_id?: mongoose.Types.ObjectId;
  stage_id?: mongoose.Types.ObjectId;
  language_id?: mongoose.Types.ObjectId;
  cycle_number?: number;
  machine_number?: string;
  audio_start_time?: Date;
  audio_end_time?: Date;
  audio_duration?: number; // in seconds
  playback_status?: 'playing' | 'paused' | 'completed' | 'interrupted';
  completion_percentage?: number;
  playback_speed?: number;
  // Common fields
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  status: 'active' | 'completed' | 'terminated';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const TrackingSchema: Schema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    operator_id: { type: String },
    emp_code: { type: String, required: true },
    user_name: { type: String, required: true },
    tracking_type: {
      type: String,
      enum: ['login', 'audio_playback'],
      required: true
    },
    // Login-specific fields
    login_time: { type: Date },
    logout_time: { type: Date },
    session_duration: { type: Number }, // in seconds
    // Audio playback-specific fields
    audio_sop_id: { type: Schema.Types.ObjectId, ref: 'AudioSop' },
    audio_file_id: { type: Schema.Types.ObjectId },
    product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
    stage_id: { type: Schema.Types.ObjectId, ref: 'Stage' },
    language_id: { type: Schema.Types.ObjectId, ref: 'Language' },
    cycle_number: { type: Number, default: 1 },
    machine_number: { type: String },
    audio_start_time: { type: Date },
    audio_end_time: { type: Date },
    audio_duration: { type: Number }, // in seconds
    playback_status: {
      type: String,
      enum: ['playing', 'paused', 'completed', 'interrupted']
    },
    completion_percentage: { type: Number, default: 0, min: 0, max: 100 },
    playback_speed: { type: Number, default: 1.0 },
    // Common fields
    ip_address: { type: String },
    user_agent: { type: String },
    device_type: { type: String }, // mobile, desktop, tablet
    status: {
      type: String,
      enum: ['active', 'completed', 'terminated'],
      default: 'active'
    },
    notes: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

// Index for faster queries
TrackingSchema.index({ user_id: 1, created_at: -1 });
TrackingSchema.index({ operator_id: 1, created_at: -1 });
TrackingSchema.index({ emp_code: 1 });
TrackingSchema.index({ tracking_type: 1 });
TrackingSchema.index({ status: 1 });
TrackingSchema.index({ audio_sop_id: 1 });
TrackingSchema.index({ created_at: -1 });

export default mongoose.model<ITracking>('Tracking', TrackingSchema);
