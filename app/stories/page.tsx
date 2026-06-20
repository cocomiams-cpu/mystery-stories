// app/stories/page.tsx
'use client';

import { useEffect, useState } from 'react';

interface Story {
  id: number;
  prenom: string;
  code: number;
  histoire: string;   // ← AJOUTE cette ligne (ou anecdote selon le nom)
  created_at: string;
    tag?: string | null;  // ← AJOUTE ÇA (peut être 'A', 'B', ou null)
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stories')
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setStories(result.data);
        }
      })
      .catch((err) => console.error('Erreur chargement :', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-2xl">Chargement des anecdotes...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          📖 Toutes les anecdotes
        </h1>

        {stories.length === 0 ? (
          <p className="text-white text-center text-xl">Aucune anecdote pour le moment !</p>
        ) : (
          <div className="space-y-4">
            {stories.map((story) => (
              <div key={story.id} className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-violet-700 text-lg">
                    👤 {story.prenom}
                  </span>
                  <span className="text-gray-400 text-sm">
                    {new Date(story.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className="text-gray-800 text-lg italic">"{story.histoire}"</p>
                <div className="mt-2 text-sm text-gray-500">🔑 Groupe : {story.code}</div>
              </div>
            ))}
          </div>
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