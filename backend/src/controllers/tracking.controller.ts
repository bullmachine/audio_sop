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

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (tracking_type === 'login') {
      // Find or create daily tracking record
      let dailyTracking = await Tracking.findOne({
        user_id: userId,
        emp_code,
        date: today,
      });

      if (!dailyTracking) {
        dailyTracking = await Tracking.create({
          user_id: userId,
          emp_code,
          user_name,
          operator_id,
          date: today,
          sessions: [],
        });
      }

      // Create new login session
      const newSession = {
        login_time: new Date(),
        ip_address,
        user_agent,
        device_type,
        status: 'active' as const,
        audio_playbacks: [],
      };

      dailyTracking.sessions.push(newSession as any);
      dailyTracking.updated_at = new Date();
      await dailyTracking.save();

      res.status(201).json({
        message: 'Login session created successfully',
        data: {
          _id: dailyTracking.sessions[dailyTracking.sessions.length - 1]._id,
          ...newSession,
        },
      });
    } else if (tracking_type === 'audio_playback') {      
      let dailyTracking = await Tracking.findOne({
        user_id: userId,
        date: today,
      });
 
      if (!dailyTracking) {         
        const created = await Tracking.create([{
          user_id: userId,
          emp_code,
          user_name,
          operator_id,
          date: today,
          sessions: [],
        }] as any);
        dailyTracking = created[0];
      }
      

      // Find the active login session
      let activeSession = (dailyTracking as any).sessions.find((s: any) => s.status === 'active');
 
      if (!activeSession) {
        
        const newSession = {
          login_time: new Date(),
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.headers['user-agent'],
          device_type: 'desktop',
          status: 'active' as const,
          audio_playbacks: [],
        };
        (dailyTracking as any).sessions.push(newSession);
        activeSession = (dailyTracking as any).sessions[(dailyTracking as any).sessions.length - 1];
      }

      // Get the AudioSop to know total number of files
      const audioSop = await AudioSop.findById(trackingData.audio_sop_id);
      const totalFiles = audioSop?.files?.length || 0;

      // Get the last audio playback for this SOP in the current session
      const lastPlayback = activeSession.audio_playbacks
        .filter((pb: any) => pb.audio_sop_id.toString() === trackingData.audio_sop_id)
        .sort((a: any, b: any) => b.cycle_number - a.cycle_number)[0];

      // Check if all files in the current cycle are completed
      let cycleNumber = 1;
      if (lastPlayback && lastPlayback.cycle_number) {
        const completedFilesInCycle = activeSession.audio_playbacks.filter(
          (pb: any) =>
            pb.audio_sop_id.toString() === trackingData.audio_sop_id &&
            pb.cycle_number === lastPlayback.cycle_number &&
            pb.playback_status === 'completed'
        );

        if (completedFilesInCycle.length >= totalFiles && totalFiles > 0) {
          cycleNumber = lastPlayback.cycle_number + 1;
        } else {
          cycleNumber = lastPlayback.cycle_number;
        }
      }

      // Create audio playback subdocument
      const audioPlayback = {
        audio_sop_id: trackingData.audio_sop_id,
        audio_file_id: trackingData.audio_file_id,
        product_id: trackingData.product_id,
        stage_id: trackingData.stage_id,
        language_id: trackingData.language_id,
        cycle_number: cycleNumber,
        machine_number: trackingData.machine_number,
        audio_start_time: new Date(),
        playback_status: 'playing' as const,
        completion_percentage: 0,
        playback_speed: 1.0,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Check if this is the first audio playback for this SOP in this cycle
      const sopSession = activeSession.sop_sessions?.find(
        (s: any) => s.audio_sop_id.toString() === trackingData.audio_sop_id && s.cycle_number === cycleNumber
      );

      if (!sopSession) {
        // Create new SOP session
        if (!activeSession.sop_sessions) {
          activeSession.sop_sessions = [];
        }
        activeSession.sop_sessions.push({
          audio_sop_id: trackingData.audio_sop_id,
          cycle_number: cycleNumber,
          session_start_time: new Date(),
        });
      }

      // Add to the active session's audio_playbacks array
      activeSession.audio_playbacks.push(audioPlayback);
      if (dailyTracking) {
        (dailyTracking as any).updated_at = new Date();
        await dailyTracking.save();
      }

      res.status(201).json({
        message: 'Audio playback tracking created successfully',
        data: {
          _id: activeSession.audio_playbacks[activeSession.audio_playbacks.length - 1]._id,
          ...audioPlayback,
        },
      });
    }
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
    const { update_type } = req.body; // 'login' or 'audio_playback'
    const { status, completion_percentage, playback_speed, audio_duration, notes } = req.body;

    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (update_type === 'login') {
      // Update login session
      const dailyTracking = await Tracking.findOne({
        user_id: userId,
        date: today,
      });

      if (!dailyTracking) {
        return res.status(404).json({ message: 'Daily tracking record not found' });
      }

      // Find the specific login session
      const session = (dailyTracking as any).sessions.id(tracking_id);
      if (!session) {
        return res.status(404).json({ message: 'Login session not found' });
      }

      if (status) session.status = status;
      if (status === 'completed' || status === 'terminated') {
        if (session.login_time) {
          session.logout_time = new Date();
          session.session_duration = Math.floor(
            (session.logout_time.getTime() - session.login_time.getTime()) / 1000
          );
        }
      }

      (dailyTracking as any).updated_at = new Date();
      await dailyTracking.save();

      res.status(200).json({
        message: 'Login session updated successfully',
        data: session,
      });
    } else if (update_type === 'audio_playback') {
      // Update audio playback subdocument
      const dailyTracking = await Tracking.findOne({
        user_id: userId,
        date: today,
      });

      if (!dailyTracking) {
        return res.status(404).json({ message: 'Daily tracking record not found' });
      }

      // Find the audio playback in any session
      let audioPlayback = null;
      let foundSession = null;

      for (const session of (dailyTracking as any).sessions) {
        const found = session.audio_playbacks.id(tracking_id);
        if (found) {
          audioPlayback = found;
          foundSession = session;
          break;
        }
      }

      if (!audioPlayback) {
        return res.status(404).json({ message: 'Audio playback not found' });
      }

      // Update audio playback fields
      if (status) audioPlayback.playback_status = status;
      if (completion_percentage !== undefined) audioPlayback.completion_percentage = completion_percentage;
      if (playback_speed !== undefined) audioPlayback.playback_speed = playback_speed;
      if (notes !== undefined) audioPlayback.notes = notes;

      // If completed or interrupted, set end time and duration
      if (status === 'completed' || status === 'interrupted') {
        audioPlayback.audio_end_time = new Date();
        if (audio_duration !== undefined) {
          audioPlayback.audio_duration = audio_duration;
        } else if (audioPlayback.audio_start_time) {
          audioPlayback.audio_duration = Math.floor(
            (audioPlayback.audio_end_time.getTime() - audioPlayback.audio_start_time.getTime()) / 1000
          );
        }

        // Update SOP session if this completes the cycle
        const sopSession = foundSession.sop_sessions?.find(
          (s: any) => s.audio_sop_id.toString() === audioPlayback.audio_sop_id.toString() && s.cycle_number === audioPlayback.cycle_number
        );

        if (sopSession) {
          // Get all audio playbacks for this SOP cycle
          const cyclePlaybacks = foundSession.audio_playbacks.filter(
            (pb: any) => pb.audio_sop_id.toString() === audioPlayback.audio_sop_id.toString() && pb.cycle_number === audioPlayback.cycle_number
          );

          // Get total files in SOP
          const audioSop = await AudioSop.findById(audioPlayback.audio_sop_id);
          const totalFiles = audioSop?.files?.length || 0;

          // Check if all files are completed
          const completedFiles = cyclePlaybacks.filter((pb: any) => pb.playback_status === 'completed').length;

          if (completedFiles >= totalFiles && totalFiles > 0 && !sopSession.session_end_time) {
            // Cycle is complete, set session end time and total duration
            sopSession.session_end_time = new Date();
            sopSession.total_duration = Math.floor(
              (sopSession.session_end_time.getTime() - sopSession.session_start_time.getTime()) / 1000
            );
          }
        }
      }

      audioPlayback.updated_at = new Date();
      (dailyTracking as any).updated_at = new Date();
      await dailyTracking.save();

      res.status(200).json({
        message: 'Audio playback updated successfully',
        data: audioPlayback,
      });
    }
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

    const matchQuery: any = {};

    if (start_date && end_date) {
      matchQuery.date = {
        $gte: new Date(start_date as string),
        $lte: new Date(end_date as string),
      };
    }

    if (emp_code) {
      matchQuery.emp_code = emp_code;
    }

    // Aggregate by employee, date, and machine with SOP details
    // New structure: daily tracking -> sessions -> audio_playbacks
    const analysis = await Tracking.aggregate([
      { $match: matchQuery },
      {
        $unwind: '$sessions',
      },
      {
        $unwind: '$sessions.audio_playbacks',
      },
      {
        $addFields: {
          date: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          machine_number: '$sessions.audio_playbacks.machine_number',
        },
      },
      {
        $match: machine_number ? { machine_number: machine_number } : {},
      },
      {
        $group: {
          _id: {
            emp_code: '$emp_code',
            user_name: '$user_name',
            date: '$date',
            machine_number: '$machine_number',
            audio_sop_id: '$sessions.audio_playbacks.audio_sop_id',
            cycle_number: '$sessions.audio_playbacks.cycle_number',
          },
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: {
              $cond: [{ $eq: ['$sessions.audio_playbacks.playback_status', 'completed'] }, 1, 0],
            },
          },
          playbackDuration: { $sum: { $ifNull: ['$sessions.audio_playbacks.audio_duration', 0] } }, // Sum of individual play times
          avgDuration: { $avg: { $ifNull: ['$sessions.audio_playbacks.audio_duration', 0] } },
          avgCompletionPercentage: { $avg: '$sessions.audio_playbacks.completion_percentage' },
          firstAudioStart: { $min: '$sessions.audio_playbacks.audio_start_time' }, // First audio start time for SOP cycle
          lastAudioEnd: { $max: { $ifNull: ['$sessions.audio_playbacks.audio_end_time', new Date()] } }, // Last audio end time for SOP cycle
          dayFirstAudioStart: { $min: '$sessions.audio_playbacks.audio_start_time' }, // First audio start time for entire day
          dayLastAudioEnd: { $max: { $ifNull: ['$sessions.audio_playbacks.audio_end_time', new Date()] } }, // Last audio end time for entire day
          loginTimes: { $push: '$sessions.login_time' },
          logoutTimes: { $push: '$sessions.logout_time' },
        },
      },
      {
        $addFields: {
          // Calculate total duration: last audio end - first audio start (in seconds)
          totalDuration: {
            $divide: [
              { $subtract: ['$lastAudioEnd', '$firstAudioStart'] },
              1000
            ]
          },
          // Calculate day total duration: last audio end - first audio start for entire day (in seconds)
          dayTotalDuration: {
            $divide: [
              { $subtract: ['$dayLastAudioEnd', '$dayFirstAudioStart'] },
              1000
            ]
          }
        }
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
        $project: {
          _id: 0,
          emp_code: '$_id.emp_code',
          user_name: '$_id.user_name',
          date: '$_id.date',
          machine_number: '$_id.machine_number',
          audio_sop_id: '$_id.audio_sop_id',
          cycle_number: '$_id.cycle_number',
          sop_title: { $ifNull: ['$sop.sopName', 'Unknown SOP'] },
          totalSessions: 1,
          completedSessions: 1,
          totalDuration: { $round: ['$totalDuration', 2] }, // Time from first audio start to last audio end for SOP cycle
          dayTotalDuration: { $round: ['$dayTotalDuration', 2] }, // Time from first to last audio for entire day
          playbackDuration: { $round: ['$playbackDuration', 2] }, // Sum of individual play times
          avgDuration: { $round: ['$avgDuration', 2] },
          avgCompletionPercentage: { $round: ['$avgCompletionPercentage', 2] },
          loginTimes: 1,
          logoutTimes: 1,
        },
      },
      { $sort: { date: -1, emp_code: 1, machine_number: 1, cycle_number: 1 } },
    ]);

    // Get overall summary
    const summary = await Tracking.aggregate([
      { $match: matchQuery },
      {
        $unwind: '$sessions',
      },
      {
        $unwind: '$sessions.audio_playbacks',
      },
      {
        $group: {
          _id: {
            emp_code: '$emp_code',
            user_name: '$user_name',
          },
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: {
              $cond: [{ $eq: ['$sessions.audio_playbacks.playback_status', 'completed'] }, 1, 0],
            },
          },
          playbackDuration: { $sum: { $ifNull: ['$sessions.audio_playbacks.audio_duration', 0] } }, // Sum of individual play times
          avgDuration: { $avg: { $ifNull: ['$sessions.audio_playbacks.audio_duration', 0] } },
          firstAudioStart: { $min: '$sessions.audio_playbacks.audio_start_time' }, // First audio start across all sessions
          lastAudioEnd: { $max: { $ifNull: ['$sessions.audio_playbacks.audio_end_time', new Date()] } }, // Last audio end across all sessions
        },
      },
      {
        $addFields: {
          // Calculate total duration: last audio end - first audio start (in seconds)
          totalDuration: {
            $divide: [
              { $subtract: ['$lastAudioEnd', '$firstAudioStart'] },
              1000
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          emp_code: '$_id.emp_code',
          user_name: '$_id.user_name',
          totalSessions: 1,
          completedSessions: 1,
          totalDuration: { $round: ['$totalDuration', 2] }, // Time from first to last audio
          avgDuration: { $round: ['$avgDuration', 2] },
        },
      },
      { $sort: { emp_code: 1 } },
    ]);

    // Calculate overall totals for the summary cards
    const overallTotals = await Tracking.aggregate([
      { $match: matchQuery },
      {
        $unwind: '$sessions',
      },
      {
        $unwind: '$sessions.audio_playbacks',
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: {
              $cond: [{ $eq: ['$sessions.audio_playbacks.playback_status', 'completed'] }, 1, 0],
            },
          },
          firstAudioStart: { $min: '$sessions.audio_playbacks.audio_start_time' },
          lastAudioEnd: { $max: { $ifNull: ['$sessions.audio_playbacks.audio_end_time', new Date()] } },
        },
      },
      {
        $addFields: {
          totalDuration: {
            $divide: [
              { $subtract: ['$lastAudioEnd', '$firstAudioStart'] },
              1000
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          totalSessions: 1,
          completedSessions: 1,
          totalDuration: { $round: ['$totalDuration', 2] },
        },
      },
    ]);

    res.status(200).json({
      data: {
        dateWise: analysis,
        summary,
        overallTotals: overallTotals[0] || { totalSessions: 0, completedSessions: 0, totalDuration: 0 },
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
