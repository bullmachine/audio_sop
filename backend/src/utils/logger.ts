import fs from 'fs';
import path from 'path';


const logFilePath = path.join(__dirname, '../logs/app.log');

// Create the logs directory if it doesn't exist
const logDirectory = path.dirname(logFilePath);
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

// Simple function to write logs to the file
const logToFile = (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;

    fs.appendFileSync(logFilePath, logMessage, 'utf8');
};

// Export log function
export const logError = (message: string) => {
    logToFile(`ERROR: ${message}`);
};

export const logInfo = (message: string) => {
    logToFile(`INFO: ${message}`);
};

export const logWarn = (message: string) => {
    logToFile(`WARN: ${message}`);
};

// External API specific logging functions
export const logExternalApiSuccess = (requestId: string, endpoint: string, payload: any, response?: any) => {
    const logData = {
        requestId,
        endpoint,
        payload,
        response: response || 'Success',
        timestamp: new Date().toISOString()
    };
    logToFile(`EXTERNAL_API_SUCCESS: ${JSON.stringify(logData)}`);
};

export const logExternalApiError = (requestId: string, endpoint: string, payload: any, error: string, statusCode?: number) => {
    const logData = {
        requestId,
        endpoint,
        payload,
        error,
        statusCode,
        timestamp: new Date().toISOString()
    };
    logToFile(`EXTERNAL_API_ERROR: ${JSON.stringify(logData)}`);
};
