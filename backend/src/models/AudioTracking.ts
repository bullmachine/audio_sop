import mongoose, { Schema, Document, Types } from 'mongoose';

// Audio playback subdocument interface
export interface IAudioPlayback {
  _id?: Types.ObjectId;
  audio_sop_id: Types.ObjectId;
  audio_file_id: Types.ObjectId;
  product_id?: Types.ObjectId;
  stage_id?: Types.ObjectId;
  language_id?: Types.ObjectId;
  cycle_number: number;
  machine_number?: string;
  audio_start_time: Date;
  audio_end_time?: Date;
  audio_duration?: number; // in seconds (playback duration)
  playback_status: 'playing' | 'paused' | 'completed' | 'interrupted';
  completion_percentage: number;
  playback_speed: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Login session subdocument interface
export interface ILoginSession {
  _id?: Types.ObjectId;
  login_time: Date;
  logout_time?: Date;
  session_duration?: number; // in seconds
  ip_address?: string;
  user_agent?: string;
  device_type?: string;
  status: 'active' | 'completed' | 'terminated';
  audio_playbacks: IAudioPlayback[];
  sop_sessions?: {
    audio_sop_id: Types.ObjectId;
    cycle_number: number;
    session_start_time: Date;
    session_end_time?: Date;
    total_duration?: number; // in seconds (time from first to last audio)
  }[];
}

export interface ITracking extends Document {
  user_id: mongoose.Types.ObjectId;
  operator_id?: string;
  emp_code: string;
  user_name: string;
  date: Date; // Tracking date (without time)
  // Nested login sessions
  sessions: ILoginSession[];
  // Common fields
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const AudioPlaybackSchema = new Schema({
  audio_sop_id: { type: Schema.Types.ObjectId, ref: 'AudioSop', required: true },
  audio_file_id: { type: Schema.Types.ObjectId, required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
  stage_id: { type: Schema.Types.ObjectId, ref: 'Stage' },
  language_id: { type: Schema.Types.ObjectId, ref: 'Language' },
  cycle_number: { type: Number, default: 1 },
  machine_number: { type: String },
  audio_start_time: { type: Date, required: true },
  audio_end_time: { type: Date },
  audio_duration: { type: Number }, // in seconds
  playback_status: {
    type: String,
    enum: ['playing', 'paused', 'completed', 'interrupted'],
    default: 'playing'
  },
  completion_percentage: { type: Number, default: 0, min: 0, max: 100 },
  playback_speed: { type: Number, default: 1.0 },
  notes: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const LoginSessionSchema = new Schema({
  login_time: { type: Date, required: true },
  logout_time: { type: Date },
  session_duration: { type: Number }, // in seconds
  ip_address: { type: String },
  user_agent: { type: String },
  device_type: { type: String }, // mobile, desktop, tablet
  status: {
    type: String,
    enum: ['active', 'completed', 'terminated'],
    default: 'active'
  },
  audio_playbacks: [AudioPlaybackSchema],
  sop_sessions: [{
    audio_sop_id: { type: Schema.Types.ObjectId, ref: 'AudioSop' },
    cycle_number: { type: Number },
    session_start_time: { type: Date, required: true },
    session_end_time: { type: Date },
    total_duration: { type: Number }, // in seconds (time from first to last audio)
  }],
});

const TrackingSchema: Schema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    operator_id: { type: String },
    emp_code: { type: String, required: true },
    user_name: { type: String, required: true },
    date: { type: Date, required: true }, // Tracking date (without time)
    // Nested login sessions
    sessions: [LoginSessionSchema],
    // Common fields
    notes: { type: String },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

// Index for faster queries
TrackingSchema.index({ user_id: 1, date: -1 });
TrackingSchema.index({ operator_id: 1, date: -1 });
TrackingSchema.index({ emp_code: 1, date: -1 });
TrackingSchema.index({ date: -1 });
TrackingSchema.index({ 'sessions.audio_playbacks.audio_sop_id': 1 });

export default mongoose.model<ITracking>('Tracking', TrackingSchema);
