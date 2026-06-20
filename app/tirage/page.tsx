// app/tirage/page.tsx
'use client';

import { useEffect, useState } from 'react';

interface Story {
  id: number;
  prenom: string;
  code: number;
  histoire: string;
  tag?: string | null;
}

interface Match {
  personne: string;
  histoire: string;
}

export default function TiragePage() {
  const [groupes, setGroupes] = useState<Record<number, Story[]>>({});
  const [groupe1, setGroupe1] = useState<number | null>(null);
  const [groupe2, setGroupe2] = useState<number | null>(null);
  const [matchs, setMatchs] = useState<Match[]>([]);
  const [historique, setHistorique] = useState<any[]>([]);

  // Charger les anecdotes
  useEffect(() => {
    fetch('/api/stories')
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          const data: Story[] = result.data || [];
          const grouped: Record<number, Story[]> = {};
          data.forEach((story) => {
            const code = story.code;
            if (!grouped[code]) grouped[code] = [];
            grouped[code].push(story);
          });
          setGroupes(grouped);
          const keys = Object.keys(grouped).map(Number).sort();
          if (keys.length >= 2) {
            setGroupe1(keys[0]);
            setGroupe2(keys[1]);
          } else if (keys.length === 1) {
            setGroupe1(keys[0]);
            setGroupe2(keys[0]);
          }
        }
      })
      .catch(console.error);
  }, []);

  // Charger l'historique
  useEffect(() => {
    const saved = localStorage.getItem('tirage_historique');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setHistorique(parsed);
      } catch {
        localStorage.removeItem('tirage_historique');
      }
    }
  }, []);

  // 1. Sélection aléatoire de 2 groupes
  const choisirGroupesAleatoires = () => {
    const keys = Object.keys(groupes).map(Number);
    if (keys.length < 2) {
      alert('Il faut au moins 2 groupes avec des anecdotes.');
      return;
    }
    const shuffled = [...keys].sort(() => Math.random() - 0.5);
    setGroupe1(shuffled[0]);
    setGroupe2(shuffled[1]);
  };

  // 2. Tirage classique (2 groupes)
  const lancerTirageComplet = () => {
    if (groupe1 === null || groupe2 === null) {
      alert('Veuillez sélectionner deux groupes.');
      return;
    }
    if (groupe1 === groupe2) {
      alert('Les deux groupes doivent être différents.');
      return;
    }

    const personnes = groupes[groupe1] || [];
    const histoires = groupes[groupe2] || [];

    if (personnes.length === 0 || histoires.length === 0) {
      alert('Un des groupes est vide.');
      return;
    }

    if (histoires.length < personnes.length) {
      alert(
        `Il n'y a que ${histoires.length} histoires dans le groupe ${groupe2}, ` +
        `mais ${personnes.length} personnes dans le groupe ${groupe1}.`
      );
      return;
    }

    const personnesMelangees = [...personnes].sort(() => Math.random() - 0.5);
    const histoiresMelangees = [...histoires].sort(() => Math.random() - 0.5);
    const histoiresChoisies = histoiresMelangees.slice(0, personnes.length);

    const nouveauxMatchs: Match[] = personnesMelangees.map((personne, index) => ({
      personne: personne.prenom,
      histoire: histoiresChoisies[index]?.histoire || '❌ Erreur',
    }));

    setMatchs(nouveauxMatchs);

    const nouvelleEntree = {
      date: new Date().toISOString(),
      type: '2groupes',
      groupePersonnes: groupe1,
      groupeHistoires: groupe2,
      matchs: nouveauxMatchs,
    };
    const newHistorique = [nouvelleEntree, ...historique];
    setHistorique(newHistorique);
    localStorage.setItem('tirage_historique', JSON.stringify(newHistorique));
  };

  // 3. 🌍 Tirage pour TOUS les groupes (avec BOUCLE AUTOMATIQUE)
  const lancerTirageGlobal = () => {
    const keys = Object.keys(groupes).map(Number);
    if (keys.length < 2) {
      alert('Il faut au moins 2 groupes pour faire un tirage global.');
      return;
    }

    let allPeople: Story[] = [];
    let allStories: Story[] = [];
    Object.values(groupes).forEach((stories) => {
      allPeople = [...allPeople, ...stories];
      allStories = [...allStories, ...stories];
    });

    if (allPeople.length === 0 || allStories.length === 0) {
      alert('Pas assez de données.');
      return;
    }

    if (allStories.length < allPeople.length) {
      alert(
        `Il y a ${allPeople.length} personnes mais seulement ${allStories.length} histoires. ` +
        `Impossible de donner une histoire unique à tout le monde.`
      );
      return;
    }

    // Fonction interne qui tente un tirage et retourne le résultat ou null
    const tenterTirage = (): Match[] | null => {
      const shuffledPeople = [...allPeople].sort(() => Math.random() - 0.5);
      const usedStoryIds = new Set<number>();
      const resultats: Match[] = [];

      for (const person of shuffledPeople) {
        const available = allStories.filter((s) => {
          if (s.code === person.code) return false;
          if (usedStoryIds.has(s.id)) return false;
          const personTag = person.tag;
          const storyTag = s.tag;
          if (personTag === 'A' && storyTag === 'B') return false;
          if (personTag === 'B' && storyTag === 'A') return false;
          return true;
        });

        if (available.length === 0) {
          return null; // Échec de cette tentative
        }

        const randomStory = available[Math.floor(Math.random() * available.length)];
        usedStoryIds.add(randomStory.id);
        resultats.push({
          personne: person.prenom,
          histoire: randomStory.histoire,
        });
      }

      return resultats;
    };

    // 🔄 Boucle de 500 tentatives maximum
    let tentative = 0;
    let resultatFinal: Match[] | null = null;

    while (tentative < 500 && resultatFinal === null) {
      resultatFinal = tenterTirage();
      tentative++;
    }

    if (resultatFinal) {
      setMatchs(resultatFinal);

      const nouvelleEntree = {
        date: new Date().toISOString(),
        type: 'global',
        matchs: resultatFinal,
      };
      const newHistorique = [nouvelleEntree, ...historique];
      setHistorique(newHistorique);
      localStorage.setItem('tirage_historique', JSON.stringify(newHistorique));

      console.log(`✅ Tirage réussi après ${tentative} tentative(s).`);
    } else {
      alert(
        `❌ Impossible de trouver une combinaison valide après 500 essais.\n` +
        `Vérifie les contraintes : groupes trop petits ou tags A/B bloquants.`
      );
    }
  };

  // 4. Export PDF (sans librairie)
  const telechargerPDF = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-600 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center text-violet-700 mb-8 no-print">
          🎲 Tirage au sort
        </h1>

        <div className="flex flex-wrap items-end gap-4 mb-6 no-print">
          <div>
            <label className="block font-semibold text-gray-700">Groupe des personnes</label>
            <select
              value={groupe1 ?? ''}
              onChange={(e) => setGroupe1(Number(e.target.value))}
              className="border rounded p-2 text-gray-800 bg-white"
            >
              {Object.keys(groupes).map((key) => (
                <option key={key} value={key}>
                  Groupe {key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-gray-700">Groupe des histoires</label>
            <select
              value={groupe2 ?? ''}
              onChange={(e) => setGroupe2(Number(e.target.value))}
              className="border rounded p-2 text-gray-800 bg-white"
            >
              {Object.keys(groupes).map((key) => (
                <option key={key} value={key}>
                  Groupe {key}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={choisirGroupesAleatoires}
            className="bg-gray-700 hover:bg-gray-800 text-white rounded-xl px-4 py-2 font-bold"
          >
            🎲 Groupes aléatoires
          </button>
          <button
            onClick={lancerTirageComplet}
            className="bg-violet-700 hover:bg-violet-800 text-white rounded-xl px-6 py-2 font-bold"
          >
            🚀 Tirage 2 groupes
          </button>
          <button
            onClick={lancerTirageGlobal}
            className="bg-green-700 hover:bg-green-800 text-white rounded-xl px-6 py-2 font-bold"
          >
            🌍 Tirage TOUS les groupes
          </button>
        </div>

        <div id="resultat-tirage">
          {matchs.length > 0 && (
            <div className="bg-violet-50 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-violet-700 mb-4">✅ Résultat du tirage</h2>
              <ul className="space-y-2">
                {matchs.map((match, index) => (
                  <li key={index} className="border-b border-gray-300 pb-2 text-gray-800">
                    👤 <strong>{match.personne}</strong> doit raconter :
                    <span className="italic ml-1">"{match.histoire}"</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-500 mt-2">
                ✨ Chaque personne a une histoire différente (tirage aléatoire sans répétition).
              </p>
            </div>
          )}
        </div>

        {matchs.length > 0 && (
          <button
            onClick={telechargerPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2 font-bold mt-2 mb-6 no-print"
          >
            📄 Télécharger en PDF
          </button>
        )}

        <div className="no-print">
          <h2 className="text-2xl font-bold text-violet-700 mb-4">📋 Historique des tirages</h2>
          {historique.length === 0 ? (
            <p className="text-gray-600">Aucun tirage enregistré.</p>
          ) : (
            <ul className="space-y-4 max-h-60 overflow-y-auto">
              {historique.map((item, idx) => (
                <li key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="text-xs text-gray-400 mb-1">
                    {new Date(item.date).toLocaleString()}
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {item.type === 'global' ? (
                      '🌍 Tirage global (tous les groupes)'
                    ) : (
                      `Groupe ${item.groupePersonnes} → Groupe ${item.groupeHistoires}`
                    )}
                  </div>
                  <ul className="mt-2 space-y-1">
                    {(item.matchs || []).map((match: Match, i: number) => (
                      <li key={i} className="text-gray-800 text-sm">
                        👤 {match.personne} → "{match.histoire}"
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 text-center space-x-4 no-print">
          <a href="/" className="text-violet-600 underline hover:no-underline">
            ← Retourner à l'accueil
          </a>
        </div>
      </div>
    </main>
  );
}