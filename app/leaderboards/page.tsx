'use client';

import { useState } from 'react';
import { Trophy, Crown, ChevronDown, ChevronUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type LeaderboardTab = 'session' | 'lifetime';

interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  score: number;
  avatar?: string;
}

// Mock data for demonstration
const MOCK_SESSION_SCORES: LeaderboardEntry[] = [
  { rank: 1, username: 'PokerKing', level: 45, score: 15840 },
  { rank: 2, username: 'StoneFace99', level: 38, score: 12450 },
  { rank: 3, username: 'NoLaughZone', level: 52, score: 11200 },
  { rank: 4, username: 'DeadpanPro', level: 29, score: 9870 },
  { rank: 5, username: 'CoolCat42', level: 35, score: 8540 },
  { rank: 6, username: 'SeriousPlayer', level: 41, score: 7230 },
  { rank: 7, username: 'IceBreaker', level: 22, score: 6890 },
  { rank: 8, username: 'StoicMaster', level: 55, score: 6120 },
  { rank: 9, username: 'Emotionless', level: 18, score: 5450 },
  { rank: 10, username: 'NoSmileZone', level: 31, score: 4890 },
  { rank: 11, username: 'PokerFace2024', level: 25, score: 4320 },
  { rank: 12, username: 'StraightFace', level: 28, score: 3980 },
  { rank: 13, username: 'CoolCustomer', level: 33, score: 3650 },
  { rank: 14, username: 'NoLaughChallenge', level: 19, score: 3120 },
  { rank: 15, username: 'GuardUp', level: 42, score: 2890 },
];

const MOCK_LIFETIME_SCORES: LeaderboardEntry[] = [
  { rank: 1, username: 'LegendaryPlayer', level: 180, score: 2456000 },
  { rank: 2, username: 'NoLaughMaster', level: 150, score: 1890000 },
  { rank: 3, username: 'DeadpanKing', level: 120, score: 1456000 },
  { rank: 4, username: 'PokerFacePro', level: 90, score: 1120000 },
  { rank: 5, username: 'StoneCold', level: 75, score: 890000 },
  { rank: 6, username: 'EmotionlessWarrior', level: 60, score: 650000 },
  { rank: 7, username: 'StoicSage', level: 55, score: 480000 },
  { rank: 8, username: 'GuardTheFace', level: 45, score: 350000 },
  { rank: 9, username: 'CoolUnderPressure', level: 40, score: 245000 },
  { rank: 10, username: 'NoSmileAllowed', level: 35, score: 178000 },
  { rank: 11, username: 'SeriousGamer', level: 30, score: 145000 },
  { rank: 12, username: 'PokerPlayer1', level: 28, score: 112000 },
  { rank: 13, username: 'FaceOff', level: 25, score: 89000 },
  { rank: 14, username: 'LaughLess', level: 22, score: 65000 },
  { rank: 15, username: 'StayCool', level: 20, score: 48000 },
];

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('session');
  const [expanded, setExpanded] = useState(false);

  const data = activeTab === 'session' ? MOCK_SESSION_SCORES : MOCK_LIFETIME_SCORES;
  const displayData = expanded ? data : data.slice(0, 10);

  const formatScore = (score: number) => {
    return score.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#00FF9C] glow-mint flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8" />
          LEADERBOARDS
        </h1>
        <p className="text-gray-400 mt-2">Top players ranked by performance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab('session'); setExpanded(false); }}
          className={cn(
            "flex-1 py-3 px-4 font-bold uppercase tracking-wider border-4 border-black",
            "transition-all duration-200",
            activeTab === 'session'
              ? "bg-[#00FF9C] text-black shadow-neo"
              : "bg-[#1a1a1a] text-[#00FF9C] hover:bg-[#00FF9C]/20"
          )}
        >
          <Crown className="w-5 h-5 inline-block mr-2" />
          Session Scores
        </button>
        <button
          onClick={() => { setActiveTab('lifetime'); setExpanded(false); }}
          className={cn(
            "flex-1 py-3 px-4 font-bold uppercase tracking-wider border-4 border-black",
            "transition-all duration-200",
            activeTab === 'lifetime'
              ? "bg-[#00FF9C] text-black shadow-neo"
              : "bg-[#1a1a1a] text-[#00FF9C] hover:bg-[#00FF9C]/20"
          )}
        >
          <Trophy className="w-5 h-5 inline-block mr-2" />
          Lifetime Scores
        </button>
      </div>

      {/* Leaderboard List */}
      <div className="neo-card">
        {displayData.map((entry) => (
          <div
            key={entry.rank}
            className={cn(
              "flex items-center gap-4 p-4 border-b-2 border-black/30 last:border-b-0",
              entry.rank <= 3 && "bg-[#00FF9C]/5"
            )}
          >
            {/* Rank */}
            <div className={cn(
              "w-10 h-10 flex items-center justify-center font-bold text-lg border-2 border-black",
              entry.rank === 1 && "bg-yellow-500 text-black",
              entry.rank === 2 && "bg-gray-400 text-black",
              entry.rank === 3 && "bg-amber-700 text-white",
              entry.rank > 3 && "bg-[#1a1a1a] text-[#00FF9C]"
            )}>
              {entry.rank}
            </div>

            {/* Avatar */}
            <div className="w-12 h-12 bg-[#1a1a1a] border-2 border-black flex items-center justify-center">
              {entry.avatar ? (
                <img src={entry.avatar} alt={entry.username} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-gray-500" />
              )}
            </div>

            {/* Username & Level */}
            <div className="flex-1">
              <div className="font-bold text-lg">{entry.username}</div>
              <div className="text-sm text-gray-400">Level {entry.level}</div>
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="font-bold text-xl text-[#00FF9C]">
                {formatScore(entry.score)}
              </div>
              <div className="text-xs text-gray-400 uppercase">
                {activeTab === 'session' ? 'Session' : 'Lifetime'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expand/Collapse Button */}
      {data.length > 10 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 py-3 border-2 border-[#00FF9C] text-[#00FF9C] font-bold uppercase tracking-wider hover:bg-[#00FF9C] hover:text-black transition-all duration-200 flex items-center justify-center gap-2"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Show Less (Top 10)
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              View All ({data.length} Players)
            </>
          )}
        </button>
      )}
    </div>
  );
}
