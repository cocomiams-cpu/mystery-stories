// app/participants/page.tsx
'use client';

import { useEffect, useState } from 'react';

// On définit le type de ce qu'on va afficher
interface Participant {
  prenom: string;
  code: number;
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stories')
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          const data = result.data || [];
          // On extrait les prénoms et les codes, en évitant les doublons
          const unique = data.reduce((acc: Participant[], curr: any) => {
            const exists = acc.some(
              (p) => p.prenom === curr.prenom && p.code === curr.code
            );
            if (!exists && curr.prenom?.trim()) {
              acc.push({ prenom: curr.prenom, code: curr.code });
            }
            return acc;
          }, []);
          setParticipants(unique);
        }
      })
      .catch((err) => console.error('Erreur :', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          👥 Qui a répondu ?
        </h1>

        {participants.length === 0 ? (
          <p className="text-white text-center text-xl">Personne n'a encore répondu.</p>
        ) : (
          <ul className="bg-white rounded-2xl shadow-xl p-6 space-y-2">
            {participants.map((p, index) => (
              <li key={index} className="text-gray-800 text-lg border-b border-gray-100 pb-2">
                👤 {p.prenom} (Groupe {p.code})
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 text-center">
          <a href="/" className="text-white underline hover:no-underline">
            ← Retourner à l'accueil
          </a>
        </div>
      </div>
    </main>
  );
}