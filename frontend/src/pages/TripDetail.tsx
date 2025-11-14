import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { format } from 'date-fns';

interface Trip {
  id: string;
  number: string;
  routeFrom: string;
  routeTo: string;
  departureDate: string;
  arrivalDate?: string;
  mileage: number;
  customer: string;
  cargoType: string;
  weight: number;
  ratePerTon: number;
  amount: number;
  status: string;
  driver: { firstName: string; lastName: string; phone: string };
  tractor: { brand: string; model: string; plateNumber: string };
  trailer: { type: string; model: string; plateNumber: string };
  documents: any[];
  financeOperations: any[];
}

export default function TripDetail() {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchTrip(id);
    }
  }, [id]);

  const fetchTrip = async (tripId: string) => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      setTrip(response.data);
    } catch (error) {
      console.error('Error fetching trip:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!trip) {
    return <div>Рейс не найден</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Рейс {trip.number}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Основная информация</h2>
          <div className="space-y-2">
            <p><strong>Маршрут:</strong> {trip.routeFrom} → {trip.routeTo}</p>
            <p><strong>Клиент:</strong> {trip.customer}</p>
            <p><strong>Груз:</strong> {trip.cargoType}</p>
            <p><strong>Вес:</strong> {trip.weight} т</p>
            <p><strong>Ставка:</strong> {trip.ratePerTon} ₽/т</p>
            <p><strong>Сумма:</strong> {trip.amount.toLocaleString()} ₽</p>
            <p><strong>Статус:</strong> {trip.status}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Транспорт и водитель</h2>
          <div className="space-y-2">
            <p><strong>Водитель:</strong> {trip.driver.lastName} {trip.driver.firstName}</p>
            <p><strong>Телефон:</strong> {trip.driver.phone}</p>
            <p><strong>Тягач:</strong> {trip.tractor.brand} {trip.tractor.model} ({trip.tractor.plateNumber})</p>
            <p><strong>Прицеп:</strong> {trip.trailer.model} ({trip.trailer.plateNumber})</p>
            <p><strong>Пробег:</strong> {trip.mileage} км</p>
            <p><strong>Отправление:</strong> {format(new Date(trip.departureDate), 'dd.MM.yyyy HH:mm')}</p>
            {trip.arrivalDate && (
              <p><strong>Прибытие:</strong> {format(new Date(trip.arrivalDate), 'dd.MM.yyyy HH:mm')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Документы</h2>
        {trip.documents.length === 0 ? (
          <p className="text-gray-500">Нет документов</p>
        ) : (
          <ul className="list-disc list-inside">
            {trip.documents.map((doc) => (
              <li key={doc.id}>
                <a href={`/api/documents/${doc.id}/download`} className="text-blue-600 hover:underline">
                  {doc.fileName}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Финансовые операции</h2>
        {trip.financeOperations.length === 0 ? (
          <p className="text-gray-500">Нет операций</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left">Тип</th>
                <th className="text-left">Сумма</th>
                <th className="text-left">Дата</th>
                <th className="text-left">Описание</th>
              </tr>
            </thead>
            <tbody>
              {trip.financeOperations.map((op) => (
                <tr key={op.id}>
                  <td>{op.type}</td>
                  <td>{op.amount.toLocaleString()} ₽</td>
                  <td>{format(new Date(op.date), 'dd.MM.yyyy')}</td>
                  <td>{op.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}



