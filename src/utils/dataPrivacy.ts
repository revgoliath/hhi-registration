interface DataAccessLog {
  userId: string;
  action: 'view' | 'edit' | 'delete' | 'export';
  memberIds: string[];
  timestamp: string;
  ipAddress?: string;
}

const DATA_ACCESS_LOG_KEY = 'harvest_house_data_access_log';

export function logDataAccess(log: Omit<DataAccessLog, 'timestamp'>): void {
  try {
    const logs = getDataAccessLogs();
    const newLog: DataAccessLog = {
      ...log,
      timestamp: new Date().toISOString(),
    };
    
    logs.push(newLog);
    
    // Keep only the last 1000 logs to prevent storage bloat
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem(DATA_ACCESS_LOG_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error logging data access:', error);
  }
}

export function getDataAccessLogs(): DataAccessLog[] {
  try {
    const data = localStorage.getItem(DATA_ACCESS_LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading data access logs:', error);
    return [];
  }
}

export function clearDataAccessLogs(): void {
  try {
    localStorage.removeItem(DATA_ACCESS_LOG_KEY);
  } catch (error) {
    console.error('Error clearing data access logs:', error);
  }
}

export function exportDataAccessLogs(): string {
  try {
    const logs = getDataAccessLogs();
    return JSON.stringify(logs, null, 2);
  } catch (error) {
    console.error('Error exporting data access logs:', error);
    throw new Error('Failed to export data access logs');
  }
}