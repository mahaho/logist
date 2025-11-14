import { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/DataTable';
import { format } from 'date-fns';

interface FinanceOperation {
  id: string;
  type: string;
  amount: number;
  date: string;
  description?: string;
  driver?: { firstName: string; lastName: string };
  trip?: { number: string };
}

export default function Finance() {
  const [operations, setOperations] = useState<FinanceOperation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOperations();
  }, []);

  const fetchOperations = async () => {
    try {
      const response = await api.get('/finance');
      setOperations(response.data.data);
    } catch (error) {
      console.error('Error fetching finance operations:', error);
    } finally {
      setLoading(false);
    }
  };

  const typeLabels: Record<string, string> = {
    fuel: 'Топливо',
    carWash: 'Мойка',
    parking: 'Парковка',
    perDiem: 'Суточные',
    advance: 'Аванс',
    salary: 'Зарплата',
    repair: 'Ремонт',
    maintenance: 'ТО',
    tolls: 'Платные дороги',
    misc: 'Прочее',
  };

  const columns = [
    {
      key: 'type',
      label: 'Тип',
      render: (op: FinanceOperation) => typeLabels[op.type] || op.type,
    },
    {
      key: 'amount',
      label: 'Сумма',
      render: (op: FinanceOperation) => `${op.amount.toLocaleString()} ₽`,
    },
    {
      key: 'date',
      label: 'Дата',
      render: (op: FinanceOperation) => format(new Date(op.date), 'dd.MM.yyyy'),
    },
    {
      key: 'driver',
      label: 'Водитель',
      render: (op: FinanceOperation) =>
        op.driver ? `${op.driver.lastName} ${op.driver.firstName}` : '-',
    },
    {
      key: 'trip',
      label: 'Рейс',
      render: (op: FinanceOperation) => op.trip?.number || '-',
    },
    { key: 'description', label: 'Описание' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Финансы</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Добавить операцию
        </button>
      </div>
      <DataTable
        data={operations}
        columns={columns}
        onEdit={(op) => console.log('Edit', op)}
        onDelete={(op) => console.log('Delete', op)}
        loading={loading}
      />
    </div>
  );
}



