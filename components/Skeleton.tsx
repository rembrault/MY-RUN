import React from 'react';

// ── Bloc shimmer de base ───────────────────────────────────
const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`relative overflow-hidden rounded-lg ${className}`}
    style={{ background: 'rgba(255,255,255,0.04)' }}
  >
    <div
      className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite]"
      style={{
        background:
          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 40%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 60%, transparent 100%)',
      }}
    />
  </div>
);

// ── Skeleton : Profil ──────────────────────────────────────
export const ProfileSkeleton: React.FC = () => (
  <div className="pt-8 pb-8 animate-pulse">
    {/* Avatar */}
    <div className="flex flex-col items-center text-center mb-8">
      <Shimmer className="w-24 h-24 rounded-full mb-4" />
      <Shimmer className="h-6 w-40 rounded-lg mb-2" />
      <Shimmer className="h-4 w-56 rounded-md" />
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Shimmer className="h-3 w-12 rounded mb-2" />
          <Shimmer className="h-6 w-16 rounded" />
        </div>
      ))}
    </div>

    {/* Sections */}
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <Shimmer className="h-4 w-32 rounded mb-1.5" />
            <Shimmer className="h-3 w-48 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Skeleton : Home (programme actif) ──────────────────────
export const HomeSkeleton: React.FC = () => (
  <div className="flex flex-col gap-4 py-2 animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <Shimmer className="h-6 w-44 rounded-lg mb-2" />
        <Shimmer className="h-3 w-28 rounded" />
      </div>
      <Shimmer className="w-10 h-10 rounded-xl" />
    </div>

    {/* Programme card */}
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Shimmer className="h-3 w-24 rounded mb-3" />
      <Shimmer className="h-5 w-48 rounded-lg mb-4" />
      <Shimmer className="h-2 w-full rounded-full mb-2" />
      <div className="flex justify-between">
        <Shimmer className="h-3 w-20 rounded" />
        <Shimmer className="h-3 w-12 rounded" />
      </div>
    </div>

    {/* Semaine en cours */}
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <Shimmer className="h-3 w-32 rounded mb-4" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Shimmer className="w-8 h-8 rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <Shimmer className="h-4 w-36 rounded mb-1" />
              <Shimmer className="h-3 w-24 rounded" />
            </div>
            <Shimmer className="w-6 h-6 rounded-full" />
          </div>
        ))}
      </div>
    </div>

    {/* Stats cards */}
    <div className="grid grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Shimmer className="h-3 w-16 rounded mb-2" />
          <Shimmer className="h-6 w-20 rounded" />
        </div>
      ))}
    </div>
  </div>
);

// ── Skeleton : WeekDetail ──────────────────────────────────
export const WeekDetailSkeleton: React.FC = () => (
  <div className="py-2 animate-pulse">
    {/* Header */}
    <div className="flex items-center gap-3 mb-6">
      <Shimmer className="w-9 h-9 rounded-xl" />
      <div>
        <Shimmer className="h-5 w-32 rounded-lg mb-1.5" />
        <Shimmer className="h-3 w-20 rounded" />
      </div>
    </div>

    {/* Progress bar */}
    <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex justify-between mb-2">
        <Shimmer className="h-3 w-24 rounded" />
        <Shimmer className="h-3 w-12 rounded" />
      </div>
      <Shimmer className="h-2 w-full rounded-full" />
    </div>

    {/* Session cards */}
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3 mb-3">
            <Shimmer className="w-10 h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1">
              <Shimmer className="h-4 w-28 rounded mb-1.5" />
              <Shimmer className="h-3 w-40 rounded" />
            </div>
            <Shimmer className="w-7 h-7 rounded-full" />
          </div>
          <div className="flex gap-4">
            <Shimmer className="h-3 w-16 rounded" />
            <Shimmer className="h-3 w-20 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ── Skeleton : Statistiques ────────────────────────────────
export const StatisticsSkeleton: React.FC = () => (
  <div className="flex flex-col gap-5 py-2 animate-pulse">
    {/* Header */}
    <div>
      <Shimmer className="h-7 w-40 rounded-lg mb-2" />
      <Shimmer className="h-3 w-56 rounded" />
    </div>

    {/* Progression */}
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex justify-between mb-3">
        <Shimmer className="h-3 w-20 rounded" />
        <Shimmer className="h-6 w-12 rounded" />
      </div>
      <Shimmer className="h-2 w-full rounded-full" />
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-2 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Shimmer className="h-3 w-16 rounded mb-2" />
          <Shimmer className="h-7 w-24 rounded" />
        </div>
      ))}
    </div>

    {/* Chart placeholder */}
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <Shimmer className="h-3 w-40 rounded mb-4" />
      <Shimmer className="h-44 w-full rounded-xl" />
    </div>
  </div>
);

export default Shimmer;
