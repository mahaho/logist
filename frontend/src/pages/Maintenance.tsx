import { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/DataTable';
import { format } from 'date-fns';

interface Maintenance {
  id: string;
  type: string;
  entityType: string;
  transportId: string;
  date: string;
  mileage: number;
  tasks: string[];
  materials: string[];
  cost: number;
  mechanic: { firstName: string; lastName: string };
}

export default function Maintenance() {
  const [records, setRecords] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await api.get('/maintenance');
      setRecords(response.data.data);
    } catch (error) {
      console.error('Error fetching maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'type',
      label: 'Тип',
      render: (record: Maintenance) => record.type === 'scheduled' ? 'Плановое' : 'Внеплановое',
    },
    {
      key: 'entityType',
      label: 'Тип ТС',
      render: (record: Maintenance) => record.entityType === 'tractor' ? 'Тягач' : 'Прицеп',
    },
    {
      key: 'date',
      label: 'Дата',
      render: (record: Maintenance) => format(new Date(record.date), 'dd.MM.yyyy'),
    },
    { key: 'mileage', label: 'Пробег' },
    {
      key: 'tasks',
      label: 'Работы',
      render: (record: Maintenance) => record.tasks.join(', ') || '-',
    },
    { key: 'cost', label: 'Стоимость', render: (record: Maintenance) => `${record.cost.toLocaleString()} ₽` },
    {
      key: 'mechanic',
      label: 'Механик',
      render: (record: Maintenance) => `${record.mechanic.lastName} ${record.mechanic.firstName}`,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ТО / Ремонты</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Добавить запись
        </button>
      </div>
      <DataTable
        data={records}
        columns={columns}
        onEdit={(record) => console.log('Edit', record)}
        onDelete={(record) => console.log('Delete', record)}
        loading={loading}
      />
    </div>
  );
}



