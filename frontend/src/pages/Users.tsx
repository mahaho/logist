import { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/DataTable';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'firstName', label: 'Имя' },
    { key: 'lastName', label: 'Фамилия' },
    { key: 'role', label: 'Роль' },
    {
      key: 'createdAt',
      label: 'Создан',
      render: (user: User) => new Date(user.createdAt).toLocaleDateString('ru-RU'),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Пользователи</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Добавить пользователя
        </button>
      </div>
      <DataTable
        data={users}
        columns={columns}
        onEdit={(user) => console.log('Edit', user)}
        onDelete={(user) => console.log('Delete', user)}
        loading={loading}
      />
    </div>
  );
}



