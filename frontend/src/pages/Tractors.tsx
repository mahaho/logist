import { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/DataTable';

interface Tractor {
  id: string;
  brand: string;
  model: string;
  vin: string;
  plateNumber: string;
  mileage: number;
  year: number;
  status: string;
  fuelType: string;
  consumption: number;
}

export default function Tractors() {
  const [tractors, setTractors] = useState<Tractor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTractors();
  }, []);

  const fetchTractors = async () => {
    try {
      const response = await api.get('/tractors');
      setTractors(response.data.data);
    } catch (error) {
      console.error('Error fetching tractors:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'brand',
      label: 'Марка / Модель',
      render: (tractor: Tractor) => `${tractor.brand} ${tractor.model}`,
    },
    { key: 'plateNumber', label: 'Гос. номер' },
    { key: 'vin', label: 'VIN' },
    { key: 'year', label: 'Год' },
    { key: 'mileage', label: 'Пробег' },
    { key: 'status', label: 'Статус' },
    { key: 'fuelType', label: 'Топливо' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Тягачи</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Добавить тягач
        </button>
      </div>
      <DataTable
        data={tractors}
        columns={columns}
        onEdit={(tractor) => console.log('Edit', tractor)}
        onDelete={(tractor) => console.log('Delete', tractor)}
        loading={loading}
      />
    </div>
  );
}



