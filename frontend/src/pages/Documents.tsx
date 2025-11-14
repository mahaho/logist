import { useEffect, useState } from 'react';
import api from '../lib/api';
import DataTable from '../components/DataTable';
import { format } from 'date-fns';

interface Document {
  id: string;
  type: string;
  entityType: string;
  entityId: string;
  number?: string;
  issueDate?: string;
  expiryDate?: string;
  fileName: string;
  description?: string;
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'type', label: 'Тип' },
    {
      key: 'entityType',
      label: 'Сущность',
      render: (doc: Document) => {
        const labels: Record<string, string> = {
          driver: 'Водитель',
          tractor: 'Тягач',
          trailer: 'Прицеп',
          trip: 'Рейс',
        };
        return labels[doc.entityType] || doc.entityType;
      },
    },
    { key: 'number', label: 'Номер' },
    {
      key: 'issueDate',
      label: 'Дата выдачи',
      render: (doc: Document) => doc.issueDate ? format(new Date(doc.issueDate), 'dd.MM.yyyy') : '-',
    },
    {
      key: 'expiryDate',
      label: 'Срок действия',
      render: (doc: Document) => {
        if (!doc.expiryDate) return '-';
        const date = new Date(doc.expiryDate);
        const isExpired = date < new Date();
        const isExpiring = date < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return (
          <span className={isExpired ? 'text-red-600' : isExpiring ? 'text-yellow-600' : ''}>
            {format(date, 'dd.MM.yyyy')}
          </span>
        );
      },
    },
    {
      key: 'fileName',
      label: 'Файл',
      render: (doc: Document) => (
        <a
          href={`/api/documents/${doc.id}/download`}
          className="text-blue-600 hover:underline"
        >
          {doc.fileName}
        </a>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Документы</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Загрузить документ
        </button>
      </div>
      <DataTable
        data={documents}
        columns={columns}
        onEdit={(doc) => console.log('Edit', doc)}
        onDelete={(doc) => console.log('Delete', doc)}
        loading={loading}
      />
    </div>
  );
}



