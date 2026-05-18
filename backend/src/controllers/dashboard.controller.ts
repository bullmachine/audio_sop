import { Request, Response } from 'express'; 
import { AuthRequest } from '../types/express';

export const getDashboardSummary = async (req: AuthRequest, res: Response) => {
  try {
     
  } catch (error: any) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard summary',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Single dashboard endpoint that returns all data - OPTIMIZED
export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
     
    
 
  } catch (error: any) {
    console.error('Dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const getDashboardTrends = async (req: AuthRequest, res: Response) => {
  try {
    
  } catch (error: any) {
    console.error('Dashboard trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard trends',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    
  } catch (error: any) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard analytics',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
 

export const getUniquePlants = async (req: AuthRequest, res: Response) => {
  try {
     
  } catch (error: any) {
    console.error('Get unique plants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unique plants',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
