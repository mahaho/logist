import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { Truck, Package, Route, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    tractors: 0,
    trailers: 0,
    trips: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tractorsRes, trailersRes, tripsRes] = await Promise.all([
          api.get('/tractors?limit=1'),
          api.get('/trailers?limit=1'),
          api.get('/trips?limit=1'),
        ]);

        setStats({
          tractors: tractorsRes.data.pagination.total,
          trailers: trailersRes.data.pagination.total,
          trips: tripsRes.data.pagination.total,
          revenue: 0, // Calculate from trips
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const roleLabels: Record<string, string> = {
    admin: 'Администратор',
    dispatcher: 'Диспетчер',
    accountant: 'Бухгалтер',
    mechanic: 'Механик',
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Добро пожаловать, {user?.firstName} {user?.lastName}
      </h1>
      <p className="text-gray-600 mb-6">Роль: {roleLabels[user?.role || '']}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Тягачи</p>
              <p className="text-2xl font-bold">{stats.tractors}</p>
            </div>
            <Truck className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Прицепы</p>
              <p className="text-2xl font-bold">{stats.trailers}</p>
            </div>
            <Package className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Рейсы</p>
              <p className="text-2xl font-bold">{stats.trips}</p>
            </div>
            <Route className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Доходы</p>
              <p className="text-2xl font-bold">{stats.revenue.toLocaleString()} ₽</p>
            </div>
            <DollarSign className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/trips"
            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <h3 className="font-medium">Создать рейс</h3>
            <p className="text-sm text-gray-600">Добавить новый рейс</p>
          </a>
          <a
            href="/maintenance"
            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <h3 className="font-medium">ТО / Ремонт</h3>
            <p className="text-sm text-gray-600">Записать ТО или ремонт</p>
          </a>
          <a
            href="/reports"
            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <h3 className="font-medium">Отчёты</h3>
            <p className="text-sm text-gray-600">Просмотреть отчёты</p>
          </a>
        </div>
      </div>
    </div>
  );
}



