import { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/DataTable';

interface Trailer {
  id: string;
  type: string;
  model: string;
  plateNumber: string;
  year: number;
  mileage: number;
  payload: number;
}

export default function Trailers() {
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrailers();
  }, []);

  const fetchTrailers = async () => {
    try {
      const response = await api.get('/trailers');
      setTrailers(response.data.data);
    } catch (error) {
      console.error('Error fetching trailers:', error);
    } finally {
      setLoading(false);
    }
  };

  const typeLabels: Record<string, string> = {
    tent: 'Тент',
    refrigerator: 'Рефрижератор',
    curtain: 'Шторный',
    board: 'Бортовой',
  };

  const columns = [
    {
      key: 'type',
      label: 'Тип',
      render: (trailer: Trailer) => typeLabels[trailer.type] || trailer.type,
    },
    { key: 'model', label: 'Модель' },
    { key: 'plateNumber', label: 'Гос. номер' },
    { key: 'year', label: 'Год' },
    { key: 'mileage', label: 'Пробег' },
    { key: 'payload', label: 'Грузоподъёмность (т)' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Прицепы</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Добавить прицеп
        </button>
      </div>
      <DataTable
        data={trailers}
        columns={columns}
        onEdit={(trailer) => console.log('Edit', trailer)}
        onDelete={(trailer) => console.log('Delete', trailer)}
        loading={loading}
      />
    </div>
  );
}



