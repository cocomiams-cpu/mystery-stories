'use client';

import { useState } from 'react';

export default function Home() {
  const [prenom, setPrenom] = useState('');
  const [code, setCode] = useState('');
  const [anecdote, setAnecdote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = { prenom, code, anecdote };

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        alert('✅ Anecdote envoyée et sauvegardée !');
        setPrenom('');
        setCode('');
        setAnecdote('');
      } else {
        alert('❌ Erreur : ' + result.message);
      }
    } catch (error) {
      console.error('Erreur réseau :', error);
      alert('❌ Problème de connexion au serveur');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg">
        <h1 className="text-4xl font-bold text-center text-violet-700">
          🎭 Mystery Stories
        </h1>
        <p className="text-center text-gray-600 mt-2 mb-8">
          Le jeu des anecdotes anonymes
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 font-semibold text-gray-800">Prénom</label>
            <input
              type="text"
              placeholder="Ton prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-black placeholder-gray-400 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800">Code secret</label>
            <input
              type="password"
              placeholder="Choisis un code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-black placeholder-gray-400 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-800">Ton anecdote</label>
            <textarea
              rows={6}
              placeholder="Raconte une anecdote que les autres devront deviner..."
              value={anecdote}
              onChange={(e) => setAnecdote(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-black placeholder-gray-400 focus:border-violet-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-violet-700 hover:bg-violet-800 text-white rounded-xl p-4 font-bold transition"
          >
            Envoyer mon anecdote
          </button>

          <div className="text-center mt-4">
            <a href="/stories" className="text-violet-600 hover:underline">
              Voir toutes les anecdotes →
            </a>
          </div>
        </form>
      </div>
    </main>
  );
}