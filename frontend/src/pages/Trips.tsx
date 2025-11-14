import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import DataTable from '../components/DataTable';
import { format } from 'date-fns';

interface Trip {
  id: string;
  number: string;
  routeFrom: string;
  routeTo: string;
  departureDate: string;
  arrivalDate?: string;
  customer: string;
  cargoType: string;
  weight: number;
  amount: number;
  status: string;
  driver: { firstName: string; lastName: string };
  tractor: { plateNumber: string };
  trailer: { plateNumber: string };
}

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await api.get('/trips');
      setTrips(response.data.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusLabels: Record<string, string> = {
    planned: 'Запланирован',
    in_progress: 'В пути',
    completed: 'Завершён',
    cancelled: 'Отменён',
  };

  const columns = [
    {
      key: 'number',
      label: 'Номер',
      render: (trip: Trip) => (
        <Link to={`/trips/${trip.id}`} className="text-blue-600 hover:underline">
          {trip.number}
        </Link>
      ),
    },
    {
      key: 'route',
      label: 'Маршрут',
      render: (trip: Trip) => `${trip.routeFrom} → ${trip.routeTo}`,
    },
    { key: 'customer', label: 'Клиент' },
    { key: 'cargoType', label: 'Груз' },
    { key: 'weight', label: 'Вес (т)' },
    {
      key: 'amount',
      label: 'Сумма',
      render: (trip: Trip) => `${trip.amount.toLocaleString()} ₽`,
    },
    {
      key: 'departureDate',
      label: 'Отправление',
      render: (trip: Trip) => format(new Date(trip.departureDate), 'dd.MM.yyyy'),
    },
    {
      key: 'status',
      label: 'Статус',
      render: (trip: Trip) => statusLabels[trip.status] || trip.status,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Рейсы</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Создать рейс
        </button>
      </div>
      <DataTable
        data={trips}
        columns={columns}
        onEdit={(trip) => console.log('Edit', trip)}
        onDelete={(trip) => console.log('Delete', trip)}
        loading={loading}
      />
    </div>
  );
}



