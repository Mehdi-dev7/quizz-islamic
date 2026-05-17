'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// ============================================
// TYPES
// ============================================
interface LeaderboardEntry {
  rank: number;
  userId: string;
  pseudo: string;
  avatar: string;
  level: number;
  correctAnswers: number;
  totalQuestions: number;
  bonusCorrect: number;
  percentage: number;
  completedAt: string;
}

// Médailles pour les 3 premiers
const MEDALS = ['🥇', '🥈', '🥉'];

// ============================================
// PAGE CLASSEMENT
// ============================================
export default function LeaderboardPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.status === 401) { router.push(`/${locale}/login`); return; }
        if (!res.ok) throw new Error();
        const data = await res.json();
        setScores(data.scores);
        setCurrentUserId(data.currentUserId);
      } catch {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [locale, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <p className="text-white/70 font-medium">Chargement du classement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-white font-semibold mb-4">Erreur de chargement</p>
          <Link href={`/${locale}/categories`} className="px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold">
            Retour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4 py-10">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🏆</div>
          <h1 className="text-4xl font-black text-white mb-2">Classement</h1>
          <p className="text-white/60">Meilleurs scores à l&apos;examen</p>
        </div>

        {/* Podium top 3 */}
        {scores.length >= 3 && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {/* 2ème */}
            <PodiumCard entry={scores[1]} isCurrent={scores[1].userId === currentUserId} height="h-24" />
            {/* 1er */}
            <PodiumCard entry={scores[0]} isCurrent={scores[0].userId === currentUserId} height="h-32" />
            {/* 3ème */}
            <PodiumCard entry={scores[2]} isCurrent={scores[2].userId === currentUserId} height="h-20" />
          </div>
        )}

        {/* Liste complète */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden">
          {scores.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-white/70 font-medium">Aucun score pour l&apos;instant</p>
              <p className="text-white/50 text-sm mt-1">Passez votre premier examen !</p>
              <Link
                href={`/${locale}/exam`}
                className="inline-block mt-6 px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-colors"
              >
                🎯 Passer l&apos;examen
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {scores.map((entry) => (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                    entry.userId === currentUserId ? 'bg-yellow-400/20' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Rang */}
                  <div className="w-10 text-center shrink-0">
                    {entry.rank <= 3 ? (
                      <span className="text-2xl">{MEDALS[entry.rank - 1]}</span>
                    ) : (
                      <span className="text-white/60 font-bold">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Pseudo + niveau */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold truncate ${entry.userId === currentUserId ? 'text-yellow-300' : 'text-white'}`}>
                      {entry.pseudo}
                      {entry.userId === currentUserId && (
                        <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-semibold">Vous</span>
                      )}
                    </p>
                    <p className="text-white/50 text-sm">Niveau {entry.level}</p>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <p className="text-white font-bold text-lg">{entry.correctAnswers}/{entry.totalQuestions}</p>
                    <p className="text-white/50 text-sm">{entry.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-center">
          <Link
            href={`/${locale}/exam`}
            className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-colors"
          >
            🎯 Passer l&apos;examen
          </Link>
          <Link
            href={`/${locale}/categories`}
            className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors"
          >
            ← Catégories
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPOSANT PODIUM
// ============================================
function PodiumCard({ entry, isCurrent, height }: { entry: LeaderboardEntry; isCurrent: boolean; height: string }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <div className="text-2xl">{MEDALS[entry.rank - 1]}</div>
      <div className={`bg-white/10 rounded-xl w-full ${height} flex items-end justify-center pb-3`}>
        <div className="text-center">
          <p className={`text-sm font-bold truncate max-w-[80px] ${isCurrent ? 'text-yellow-300' : 'text-white'}`}>
            {entry.pseudo}
          </p>
          <p className="text-white/60 text-xs">{entry.correctAnswers}/{entry.totalQuestions}</p>
        </div>
      </div>
    </div>
  );
}
