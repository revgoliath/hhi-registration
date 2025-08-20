import React, { useState } from 'react';
import { Shield, Download, Trash2, Eye, AlertTriangle, Lock, FileText, Users } from 'lucide-react';
import { storageService } from '../utils/storage';
import { getDataAccessLogs, clearDataAccessLogs, exportDataAccessLogs } from '../utils/dataPrivacy';

const DataPrivacy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'export' | 'settings'>('overview');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const members = storageService.getMembers();
  const accessLogs = getDataAccessLogs();

  const handleExportData = () => {
    try {
      const data = storageService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `harvest_house_data_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  const handleExportLogs = () => {
    try {
      const logs = exportDataAccessLogs();
      const blob = new Blob([logs], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `harvest_house_access_logs_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export logs failed:', error);
      alert('Failed to export access logs');
    }
  };

  const handleClearLogs = () => {
    if (showConfirmClear) {
      clearDataAccessLogs();
      setShowConfirmClear(false);
      window.location.reload();
    } else {
      setShowConfirmClear(true);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL church data? This action cannot be undone and will remove all members, events, and records.')) {
      if (window.confirm('This is your final warning. ALL DATA WILL BE PERMANENTLY DELETED. Are you absolutely sure?')) {
        storageService.clearAllData();
        clearDataAccessLogs();
        alert('All data has been cleared.');
        window.location.reload();
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'logs', label: 'Access Logs', icon: Eye },
    { id: 'export', label: 'Data Export', icon: Download },
    { id: 'settings', label: 'Settings', icon: Lock },
  ];

  const InfoCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
  }> = ({ title, value, icon: Icon, color }) => (
    <div className={`bg-white rounded-xl shadow-sm border-l-4 ${color} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
          <Icon className={`h-6 w-6 ${color.replace('border-', 'text-')}`} />
        </div>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard
          title="Total Members"
          value={members.length}
          icon={Users}
          color="border-blue-500"
        />
        <InfoCard
          title="Access Log Entries"
          value={accessLogs.length}
          icon={Eye}
          color="border-green-500"
        />
        <InfoCard
          title="Data Storage"
          value="Local Browser"
          icon={Lock}
          color="border-purple-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Privacy Information</h3>
        <div className="space-y-4 text-gray-700">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Local Storage</h4>
              <p className="text-sm">All member data is stored locally in your browser. No data is sent to external servers.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Eye className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Access Logging</h4>
              <p className="text-sm">All data access, modifications, and exports are logged for audit purposes.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Data Export</h4>
              <p className="text-sm">You can export all data at any time in JSON format for backup or migration purposes.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Important Notice</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Since data is stored locally in your browser, clearing browser data or using a different device will result in data loss. 
              Regular backups using the export feature are recommended.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Data Access Logs</h3>
        <div className="flex space-x-3">
          <button
            onClick={handleExportLogs}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Logs</span>
          </button>
          <button
            onClick={handleClearLogs}
            className={`px-4 py-2 font-medium rounded-lg transition-colors flex items-center space-x-2 ${
              showConfirmClear 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            <span>{showConfirmClear ? 'Confirm Clear' : 'Clear Logs'}</span>
          </button>
        </div>
      </div>

      {accessLogs.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Members Affected
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accessLogs.slice(-50).reverse().map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.action === 'view' ? 'bg-blue-100 text-blue-800' :
                        log.action === 'edit' ? 'bg-yellow-100 text-yellow-800' :
                        log.action === 'delete' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.userId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.memberIds.length} member(s)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Eye className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No access logs yet</h3>
          <p className="text-gray-600">Access logs will appear here as you interact with member data</p>
        </div>
      )}
    </div>
  );

  const renderExport = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Church Data</h3>
        <p className="text-gray-600 mb-6">
          Export all church data including members, special events, and records in JSON format. 
          This can be used for backup purposes or migrating to another system.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Complete Data Export</h4>
              <p className="text-sm text-gray-600">Includes all members, events, and metadata</p>
            </div>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Data</span>
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Access Logs Export</h4>
              <p className="text-sm text-gray-600">Export audit trail and access logs</p>
            </div>
            <button
              onClick={handleExportLogs}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Logs</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Export Information</h4>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Exported data is in JSON format and can be imported back into the system</li>
              <li>• All sensitive information remains encrypted and secure</li>
              <li>• Export includes timestamp and version information</li>
              <li>• Regular exports are recommended for data backup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management Settings</h3>
        
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-6">
            <h4 className="font-medium text-gray-900 mb-2">Access Logging</h4>
            <p className="text-sm text-gray-600 mb-4">
              All data access and modifications are automatically logged for audit purposes.
            </p>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">Enable access logging (always on)</label>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 pb-6">
            <h4 className="font-medium text-gray-900 mb-2">Data Retention</h4>
            <p className="text-sm text-gray-600 mb-4">
              Access logs are automatically limited to the most recent 1000 entries to prevent storage bloat.
            </p>
            <div className="text-sm text-gray-500">
              Current log entries: {accessLogs.length}/1000
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Storage</h4>
            <p className="text-sm text-gray-600 mb-4">
              All data is stored locally in your browser's localStorage. No data is transmitted to external servers.
            </p>
            <div className="text-sm text-gray-500">
              Storage location: Browser localStorage
            </div>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-red-800">Danger Zone</h4>
            <p className="text-sm text-red-700 mt-1 mb-4">
              These actions are irreversible and will permanently delete data.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleClearLogs}
                className="px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Access Logs</span>
              </button>
              <button
                onClick={handleClearAllData}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete All Church Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-lg text-white p-8">
        <h1 className="text-3xl font-bold mb-2">Data Privacy & Security</h1>
        <p className="text-blue-100 text-lg">Manage your church data privacy and security settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-4 text-center font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'logs' && renderLogs()}
          {activeTab === 'export' && renderExport()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>
    </div>
  );
};

export default DataPrivacy;