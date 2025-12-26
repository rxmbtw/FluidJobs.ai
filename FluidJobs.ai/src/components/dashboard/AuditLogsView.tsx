import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Download, Trash2, Settings } from 'lucide-react';

interface AuditLog {
  id: number;
  user_name: string;
  action_type: string;
  action_description: string;
  created_at: string;
  ip_address?: string;
}

interface AuditSettings {
  retention_days: number;
  auto_purge_enabled: boolean;
}

const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState<AuditSettings>({ retention_days: 90, auto_purge_enabled: true });
  const [retentionDays, setRetentionDays] = useState(90);
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchSettings();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchLogs(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get<{logs: AuditLog[]}>(`http://localhost:8000/api/superadmin/audit-logs?search=${searchQuery}`);
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get<AuditSettings>('http://localhost:8000/api/superadmin/audit-settings');
      setSettings(response.data);
      setRetentionDays(response.data.retention_days);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await axios.get<{logs: AuditLog[]}>('http://localhost:8000/api/superadmin/audit-logs/export');
      const blob = new Blob([JSON.stringify(response.data.logs, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (error) {
      console.error('Error exporting logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await axios.put('http://localhost:8000/api/superadmin/audit-settings', {
        retention_days: retentionDays,
        auto_purge_enabled: settings.auto_purge_enabled
      });
      alert('Settings saved successfully');
      fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  const handlePurge = async () => {
    try {
      setLoading(true);
      const response = await axios.delete<{deleted: number}>(`http://localhost:8000/api/superadmin/audit-logs/purge?days=${retentionDays}`);
      alert(`${response.data.deleted} logs purged successfully`);
      setShowPurgeConfirm(false);
      fetchLogs();
    } catch (error) {
      console.error('Error purging logs:', error);
      alert('Failed to purge logs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600">View system activity and user actions</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="relative flex-1 mr-4">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Download size={20} className="mr-2" />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Timestamp</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Action</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Description</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {new Date(log.created_at).toLocaleString('en-IN', { 
                      timeZone: 'Asia/Kolkata',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">{log.user_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{log.action_type}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{log.action_description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Settings size={20} className="mr-2" />
          Log Retention Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Retention Period (days)
            </label>
            <input
              type="number"
              value={retentionDays}
              onChange={(e) => setRetentionDays(parseInt(e.target.value))}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setShowPurgeConfirm(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 size={20} className="mr-2" />
              Purge
            </button>
          </div>
        </div>
      </div>

      {showPurgeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Purge</h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete all logs older than {retentionDays} days. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowPurgeConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePurge}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsView;
