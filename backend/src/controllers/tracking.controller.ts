import { Request, Response } from 'express';
import { AuthRequest } from '../types/express';
import Tracking from '../models/AudioTracking';
import AudioSop from '../models/AudioSop';
import User from '../models/User';

// Create tracking record (login or audio playback)
export const createTracking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { tracking_type, emp_code, user_name, operator_id, ...trackingData } = req.body;
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];

    // Detect device type from user agent
    let device_type = 'desktop';
    if (user_agent) {
      if (/mobile/i.test(user_agent)) device_type = 'mobile';
      else if (/tablet/i.test(user_agent)) device_type = 'tablet';
    }

    const trackingRecord: any = {
      user_id: userId,
      emp_code,
      user_name,
      tracking_type,
      ip_address,
      user_agent,
      device_type,
      status: 'active',
    };

    // Only include operator_id if provided
    if (operator_id) {
      trackingRecord.operator_id = operator_id;
    }

    // Add tracking type specific fields
    if (tracking_type === 'login') {
      trackingRecord.login_time = new Date();
    } else if (tracking_type === 'audio_playback') {
      trackingRecord.audio_sop_id = trackingData.audio_sop_id;
      trackingRecord.audio_file_id = trackingData.audio_file_id;
      trackingRecord.product_id = trackingData.product_id;
      trackingRecord.stage_id = trackingData.stage_id;
      trackingRecord.language_id = trackingData.language_id;

      // Get the next cycle number for this user and audio SOP
      const lastTracking = await Tracking.findOne({
        user_id: userId,
        audio_sop_id: trackingData.audio_sop_id,
        tracking_type: 'audio_playback',
      })
        .sort({ cycle_number: -1 })
        .limit(1);

      trackingRecord.cycle_number = lastTracking && lastTracking.cycle_number ? lastTracking.cycle_number + 1 : 1;
      trackingRecord.audio_start_time = new Date();
      trackingRecord.playback_status = 'playing';
      trackingRecord.completion_percentage = 0;
      trackingRecord.playback_speed = 1.0;
    }

    const tracking = await Tracking.create(trackingRecord);

    res.status(201).json({
      message: 'Tracking record created successfully',
      data: tracking,
    });
  } catch (error) {
    console.error('Error creating tracking record:', error);
    res.status(500).json({
      message: 'Failed to create tracking record',
      error: (error as Error).message,
    });
  }
};

// Update tracking record (logout or audio playback update)
export const updateTracking = async (req: AuthRequest, res: Response) => {
  try {
    const { tracking_id } = req.params;
    const userId = req.user?.id;

    const tracking = await Tracking.findOne({ _id: tracking_id, user_id: userId });

    if (!tracking) {
      return res.status(404).json({ message: 'Tracking record not found' });
    }

    const { status, completion_percentage, playback_speed, audio_duration, notes } = req.body;

    if (tracking.tracking_type === 'login') {
      // Handle login/logout update
      if (status) tracking.status = status;
      if (status === 'completed' || status === 'terminated') {
        if (tracking.login_time) {
          tracking.logout_time = new Date();
          tracking.session_duration = Math.floor(
            (tracking.logout_time.getTime() - tracking.login_time.getTime()) / 1000
          );
        }
      }
    } else if (tracking.tracking_type === 'audio_playback') {
      // Handle audio playback update
      if (status) tracking.playback_status = status;
      if (completion_percentage !== undefined) tracking.completion_percentage = completion_percentage;
      if (playback_speed !== undefined) tracking.playback_speed = playback_speed;
      if (notes !== undefined) tracking.notes = notes;

      // If completed or interrupted, set end time and duration
      if (status === 'completed' || status === 'interrupted') {
        tracking.status = 'completed';
        tracking.audio_end_time = new Date();
        // Use provided audio_duration if available, otherwise calculate from start time
        if (audio_duration !== undefined) {
          tracking.audio_duration = audio_duration;
        } else if (tracking.audio_start_time) {
          tracking.audio_duration = Math.floor(
            (tracking.audio_end_time.getTime() - tracking.audio_start_time.getTime()) / 1000
          );
        }
      }
    }

    tracking.updated_at = new Date();
    await tracking.save();

    res.status(200).json({
      message: 'Tracking record updated successfully',
      data: tracking,
    });
  } catch (error) {
    console.error('Error updating tracking record:', error);
    res.status(500).json({
      message: 'Failed to update tracking record',
      error: (error as Error).message,
    });
  }
};

// Get active tracking records for an operator
export const getActiveTracking = async (req: AuthRequest, res: Response) => {
  try {
    const { operator_id } = req.params;
    const { tracking_type } = req.query;

    const query: any = {
      operator_id,
      status: 'active',
    };

    if (tracking_type) {
      query.tracking_type = tracking_type;
    }

    const tracking = await Tracking.find(query)
      .populate('user_id', 'name empCode')
      .sort({ created_at: -1 });

    res.status(200).json({
      data: tracking,
    });
  } catch (error) {
    console.error('Error fetching active tracking:', error);
    res.status(500).json({
      message: 'Failed to fetch active tracking',
      error: (error as Error).message,
    });
  }
};

// Get tracking records with pagination and filters
export const getTracking = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 50,
      user_id,
      operator_id,
      tracking_type,
      status,
      audio_sop_id,
      start_date,
      end_date,
    } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const query: any = {};

    if (user_id) query.user_id = user_id;
    if (operator_id) query.operator_id = operator_id;
    if (tracking_type) query.tracking_type = tracking_type;
    if (status) query.status = status;
    if (audio_sop_id) query.audio_sop_id = audio_sop_id;
    if (start_date && end_date) {
      query.created_at = {
        $gte: new Date(start_date as string),
        $lte: new Date(end_date as string),
      };
    }

    const [tracking, total] = await Promise.all([
      Tracking.find(query)
        .populate('user_id', 'name empCode')
        .populate('operator_id', 'name empCode')
        .populate('audio_sop_id', 'title')
        .populate('product_id', 'name')
        .populate('stage_id', 'name')
        .populate('language_id', 'name')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Tracking.countDocuments(query),
    ]);

    res.status(200).json({
      data: tracking,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching tracking:', error);
    res.status(500).json({
      message: 'Failed to fetch tracking',
      error: (error as Error).message,
    });
  }
};

// Get tracking statistics for a user
export const getTrackingStats = async (req: Request, res: Response) => {
  try {
    const { user_id, tracking_type, start_date, end_date } = req.query;

    if (!user_id) {
      return res.status(400).json({ message: 'user_id is required' });
    }

    const matchQuery: any = { user_id };
    if (tracking_type) matchQuery.tracking_type = tracking_type;
    if (start_date && end_date) {
      matchQuery.created_at = {
        $gte: new Date(start_date as string),
        $lte: new Date(end_date as string),
      };
    }

    // Audio playback specific stats
    if (!tracking_type || tracking_type === 'audio_playback') {
      const audioMatchQuery = { ...matchQuery, tracking_type: 'audio_playback' };

      const stats = await Tracking.aggregate([
        { $match: audioMatchQuery },
        {
          $group: {
            _id: '$audio_sop_id',
            totalCycles: { $sum: 1 },
            completedCycles: {
              $sum: {
                $cond: [{ $eq: ['$playback_status', 'completed'] }, 1, 0],
              },
            },
            totalDuration: { $sum: { $ifNull: ['$audio_duration', 0] } },
            avgCompletionPercentage: { $avg: '$completion_percentage' },
            lastPlayed: { $max: '$audio_start_time' },
          },
        },
        {
          $lookup: {
            from: 'audiosops',
            localField: '_id',
            foreignField: '_id',
            as: 'sop',
          },
        },
        {
          $unwind: { path: '$sop', preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 0,
            audio_sop_id: '$_id',
            sop_title: { $ifNull: ['$sop.title', 'Unknown'] },
            totalCycles: 1,
            completedCycles: 1,
            totalDuration: 1,
            avgCompletionPercentage: { $round: ['$avgCompletionPercentage', 2] },
            lastPlayed: 1,
          },
        },
      ]);

      const overallStats = await Tracking.aggregate([
        { $match: audioMatchQuery },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            completedSessions: {
              $sum: {
                $cond: [{ $eq: ['$playback_status', 'completed'] }, 1, 0],
              },
            },
            totalDuration: { $sum: { $ifNull: ['$audio_duration', 0] } },
            avgDuration: { $avg: { $ifNull: ['$audio_duration', 0] } },
          },
        },
      ]);

      res.status(200).json({
        data: {
          bySOP: stats,
          overall: overallStats[0] || {
            totalSessions: 0,
            completedSessions: 0,
            totalDuration: 0,
            avgDuration: 0,
          },
        },
      });
    } else {
      // Login stats
      const loginMatchQuery = { ...matchQuery, tracking_type: 'login' };

      const loginStats = await Tracking.aggregate([
        { $match: loginMatchQuery },
        {
          $group: {
            _id: null,
            totalLogins: { $sum: 1 },
            completedLogins: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
              },
            },
            totalSessionDuration: { $sum: { $ifNull: ['$session_duration', 0] } },
            avgSessionDuration: { $avg: { $ifNull: ['$session_duration', 0] } },
          },
        },
      ]);

      res.status(200).json({
        data: {
          login: loginStats[0] || {
            totalLogins: 0,
            completedLogins: 0,
            totalSessionDuration: 0,
            avgSessionDuration: 0,
          },
        },
      });
    }
  } catch (error) {
    console.error('Error fetching tracking stats:', error);
    res.status(500).json({
      message: 'Failed to fetch tracking stats',
      error: (error as Error).message,
    });
  }
};

// Get employee date-wise analysis
export const getEmployeeDateWiseAnalysis = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, emp_code, machine_number } = req.query;

    const matchQuery: any = { tracking_type: 'audio_playback' };

    if (start_date && end_date) {
      matchQuery.created_at = {
        $gte: new Date(start_date as string),
        $lte: new Date(end_date as string),
      };
    }

    if (emp_code) {
      matchQuery.emp_code = emp_code;
    }

    if (machine_number) {
      matchQuery.machine_number = machine_number;
    }

    // Aggregate by employee, date, and machine with SOP details
    const analysis = await Tracking.aggregate([
      { $match: matchQuery },
      {
        $addFields: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$created_at' },
          },
        },
      },
      {
        $group: {
          _id: {
            emp_code: '$emp_code',
            date: '$date',
            machine_number: '$machine_number',
            audio_sop_id: '$audio_sop_id',
          },
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: {
              $cond: [{ $eq: ['$playback_status', 'completed'] }, 1, 0],
            },
          },
          totalDuration: { $sum: { $ifNull: ['$audio_duration', 0] } },
          avgDuration: { $avg: { $ifNull: ['$audio_duration', 0] } },
          avgCompletionPercentage: { $avg: '$completion_percentage' },
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id.emp_code',
          foreignField: 'emp_code',
          as: 'employee',
        },
      },
      {
        $unwind: { path: '$employee', preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: 'audiosops',
          localField: '_id.audio_sop_id',
          foreignField: '_id',
          as: 'sop',
        },
      },
      {
        $unwind: { path: '$sop', preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          user_name: {
            $ifNull: [
              '$employee.full_name',
              { $concat: ['$employee.first_name', ' ', '$employee.last_name'] },
              '$employee.first_name',
              'Unknown Employee'
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          emp_code: '$_id.emp_code',
          user_name: 1,
          date: '$_id.date',
          machine_number: '$_id.machine_number',
          audio_sop_id: '$_id.audio_sop_id',
          sop_title: { $ifNull: ['$sop.title', 'Unknown SOP'] },
          totalSessions: 1,
          completedSessions: 1,
          totalDuration: { $round: ['$totalDuration', 2] },
          avgDuration: { $round: ['$avgDuration', 2] },
          avgCompletionPercentage: { $round: ['$avgCompletionPercentage', 2] },
        },
      },
      { $sort: { date: -1, emp_code: 1, machine_number: 1 } },
    ]);

    // Get overall summary
    const summary = await Tracking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$emp_code',
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: {
              $cond: [{ $eq: ['$playback_status', 'completed'] }, 1, 0],
            },
          },
          totalDuration: { $sum: { $ifNull: ['$audio_duration', 0] } },
          avgDuration: { $avg: { $ifNull: ['$audio_duration', 0] } },
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: 'emp_code',
          as: 'employee',
        },
      },
      {
        $unwind: { path: '$employee', preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          user_name: {
            $ifNull: [
              '$employee.full_name',
              { $concat: ['$employee.first_name', ' ', '$employee.last_name'] },
              '$employee.first_name',
              'Unknown Employee'
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          emp_code: '$_id',
          user_name: 1,
          totalSessions: 1,
          completedSessions: 1,
          totalDuration: { $round: ['$totalDuration', 2] },
          avgDuration: { $round: ['$avgDuration', 2] },
        },
      },
      { $sort: { emp_code: 1 } },
    ]);

    res.status(200).json({
      data: {
        dateWise: analysis,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching employee date-wise analysis:', error);
    res.status(500).json({
      message: 'Failed to fetch employee date-wise analysis',
      error: (error as Error).message,
    });
  }
};
