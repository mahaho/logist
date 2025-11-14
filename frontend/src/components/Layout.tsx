import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  Link as LinkIcon,
  Route,
  Wrench,
  FileText,
  DollarSign,
  BarChart3,
  LogOut,
} from 'lucide-react';

const menuItems = [
  { path: '/', label: 'Дашборд', icon: LayoutDashboard },
  { path: '/users', label: 'Пользователи', icon: Users, roles: ['admin'] },
  { path: '/drivers', label: 'Водители', icon: Users },
  { path: '/tractors', label: 'Тягачи', icon: Truck },
  { path: '/trailers', label: 'Прицепы', icon: Package },
  { path: '/couplings', label: 'Сцепки', icon: LinkIcon },
  { path: '/trips', label: 'Рейсы', icon: Route },
  { path: '/maintenance', label: 'ТО / Ремонты', icon: Wrench },
  { path: '/documents', label: 'Документы', icon: FileText },
  { path: '/finance', label: 'Финансы', icon: DollarSign },
  { path: '/reports', label: 'Отчёты', icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role || '');
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">Логист</h1>
          <p className="text-sm text-gray-400">Транспортная компания</p>
        </div>
        <nav className="mt-4">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 hover:bg-gray-700 ${
                  isActive ? 'bg-gray-700 border-l-4 border-blue-500' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
          <div className="mb-2">
            <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-400">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выход
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}



