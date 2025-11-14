import { useState } from 'react';
import api from '../lib/api';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const reports = [
    { id: 'trip-register', label: 'Реестр рейсов', endpoint: '/reports/trips/register' },
    { id: 'trip-profit', label: 'Прибыль/убыток по рейсу', endpoint: '/reports/finance/trip' },
    { id: 'driver-finance', label: 'Финансовый отчёт по водителю', endpoint: '/reports/finance/driver' },
    { id: 'tractor-expenses', label: 'Расходы по тягачу', endpoint: '/reports/finance/tractor' },
    { id: 'trailer-expenses', label: 'Расходы по прицепу', endpoint: '/reports/finance/trailer' },
    { id: 'company-finance', label: 'Общий финансовый отчёт', endpoint: '/reports/finance/company' },
    { id: 'maintenance-history', label: 'История ТО', endpoint: '/reports/maintenance/history' },
    { id: 'upcoming-maintenance', label: 'Предстоящие ТО', endpoint: '/reports/maintenance/upcoming' },
    { id: 'driver-workload', label: 'Нагрузка водителей', endpoint: '/reports/drivers/workload' },
    { id: 'expiring-documents', label: 'Истекающие документы', endpoint: '/reports/documents/expiring' },
    { id: 'expired-documents', label: 'Просроченные документы', endpoint: '/reports/documents/expired' },
  ];

  const handleGenerateReport = async () => {
    if (!selectedReport) return;

    setLoading(true);
    try {
      const report = reports.find((r) => r.id === selectedReport);
      if (report) {
        const response = await api.get(report.endpoint);
        setReportData(response.data);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Отчёты</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Выберите отчёт</label>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="">-- Выберите отчёт --</option>
            {reports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.label}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={!selectedReport || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Генерация...' : 'Сгенерировать отчёт'}
        </button>
      </div>

      {reportData && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Результаты отчёта</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(reportData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}



