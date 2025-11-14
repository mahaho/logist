import { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/DataTable';

interface Coupling {
  id: string;
  tractor: { brand: string; model: string; plateNumber: string };
  trailer: { type: string; model: string; plateNumber: string };
  driver: { firstName: string; lastName: string; phone: string };
  isActive: boolean;
}

export default function Couplings() {
  const [couplings, setCouplings] = useState<Coupling[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCouplings();
  }, []);

  const fetchCouplings = async () => {
    try {
      const response = await api.get('/couplings');
      setCouplings(response.data.data);
    } catch (error) {
      console.error('Error fetching couplings:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'tractor',
      label: 'Тягач',
      render: (coupling: Coupling) =>
        `${coupling.tractor.brand} ${coupling.tractor.model} (${coupling.tractor.plateNumber})`,
    },
    {
      key: 'trailer',
      label: 'Прицеп',
      render: (coupling: Coupling) =>
        `${coupling.trailer.model} (${coupling.trailer.plateNumber})`,
    },
    {
      key: 'driver',
      label: 'Водитель',
      render: (coupling: Coupling) =>
        `${coupling.driver.lastName} ${coupling.driver.firstName}`,
    },
    {
      key: 'isActive',
      label: 'Статус',
      render: (coupling: Coupling) => (
        <span className={coupling.isActive ? 'text-green-600' : 'text-gray-400'}>
          {coupling.isActive ? 'Активна' : 'Неактивна'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Сцепки</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Создать сцепку
        </button>
      </div>
      <DataTable
        data={couplings}
        columns={columns}
        onEdit={(coupling) => console.log('Edit', coupling)}
        onDelete={(coupling) => console.log('Delete', coupling)}
        loading={loading}
      />
    </div>
  );
}



