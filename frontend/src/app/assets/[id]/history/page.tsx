'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { assetApi, Assignment } from '../../../../lib/api';

export default function AssetHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;
  
  const [history, setHistory] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchHistory();
  }, [assetId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await assetApi.getHistory(assetId);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur de chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              ←
            </button>
            <div>
              <h1 className="font-bold text-gray-900">Historique de l'actif</h1>
              <p className="text-xs text-gray-500">
                {history.length} affectation{history.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {history.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <p className="text-gray-600">
              Aucun historique d'affectation pour cet actif
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((assignment, index) => {
              const isActive = !assignment.returned_at;
              
              return (
                <div 
                  key={assignment.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                >
                  <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Affectation #{index + 1}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {formatDate(assignment.assigned_at)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {isActive ? 'En cours' : 'Terminée'}
                    </span>
                  </div>

                  <div className="px-6 py-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Employé</p>
                      <p className="text-sm font-medium text-gray-900">
                        {assignment.employee_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date d'affectation</p>
                      <p className="text-sm text-gray-700">
                        {formatDate(assignment.assigned_at)}
                      </p>
                    </div>

                    {assignment.returned_at && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Date de retour</p>
                        <p className="text-sm text-gray-700">
                          {formatDate(assignment.returned_at)}
                        </p>
                        {assignment.return_condition && (
                          <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${
                            assignment.return_condition === 'GOOD'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            État: {assignment.return_condition}
                          </span>
                        )}
                      </div>
                    )}

                    {assignment.notes && (
                      <div className="mt-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Notes</p>
                        <p className="text-sm text-gray-700">{assignment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}