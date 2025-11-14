import { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/DataTable';

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'ФИО',
      render: (driver: Driver) =>
        `${driver.lastName} ${driver.firstName} ${driver.middleName || ''}`.trim(),
    },
    { key: 'phone', label: 'Телефон' },
    { key: 'licenseNumber', label: 'Номер удостоверения' },
    {
      key: 'licenseExpiry',
      label: 'Срок действия',
      render: (driver: Driver) => new Date(driver.licenseExpiry).toLocaleDateString('ru-RU'),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Водители</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Добавить водителя
        </button>
      </div>
      <DataTable
        data={drivers}
        columns={columns}
        onEdit={(driver) => console.log('Edit', driver)}
        onDelete={(driver) => console.log('Delete', driver)}
        loading={loading}
      />
    </div>
  );
}



