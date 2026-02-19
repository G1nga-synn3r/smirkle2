'use client';

import { Users, User, ChevronRight, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Friend {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  lastActive: string;
  isOnline: boolean;
}

const MOCK_FRIENDS: Friend[] = [
  { id: '1', username: 'NoLaughZone', level: 28, lastActive: 'Online now', isOnline: true },
  { id: '2', username: 'StoneFace', level: 32, lastActive: 'Online now', isOnline: true },
  { id: '3', username: 'PokerPro', level: 45, lastActive: '2 hours ago', isOnline: false },
  { id: '4', username: 'CoolCat42', level: 19, lastActive: '1 day ago', isOnline: false },
  { id: '5', username: 'DeadpanMaster', level: 55, lastActive: '3 days ago', isOnline: false },
  { id: '6', username: 'SeriousPlayer', level: 22, lastActive: '1 week ago', isOnline: false },
];

export default function FriendsPage() {
  const friends = MOCK_FRIENDS;
  const onlineFriends = friends.filter(f => f.isOnline);
  const offlineFriends = friends.filter(f => !f.isOnline);

  return (
    <div className="min-h-screen bg-[#080808] text-white p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#00FF9C] glow-mint flex items-center justify-center gap-3">
          <Users className="w-8 h-8" />
          FRIENDS
        </h1>
        <p className="text-gray-400 mt-2">{friends.length} friends</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="neo-card text-center">
          <div className="text-3xl font-bold text-[#00FF9C]">{onlineFriends.length}</div>
          <div className="text-sm text-gray-400">Online Now</div>
        </div>
        <div className="neo-card text-center">
          <div className="text-3xl font-bold text-gray-400">{offlineFriends.length}</div>
          <div className="text-sm text-gray-400">Offline</div>
        </div>
      </div>

      {/* Online Friends */}
      {onlineFriends.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#00FF9C] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Online ({onlineFriends.length})
          </h2>
          <div className="space-y-2">
            {onlineFriends.map((friend) => (
              <Link key={friend.id} href={`/profile/${friend.id}`}>
                <div className="neo-card flex items-center gap-4 hover:bg-[#00FF9C]/10 transition-colors cursor-pointer">
                  {/* Avatar with Online Indicator */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-[#1a1a1a] border-2 border-black flex items-center justify-center">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{friend.username}</div>
                    <div className="text-sm text-gray-400">Level {friend.level}</div>
                  </div>

                  {/* Last Active */}
                  <div className="text-sm text-green-500">{friend.lastActive}</div>

                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Offline Friends */}
      {offlineFriends.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-400 mb-3">
            Offline ({offlineFriends.length})
          </h2>
          <div className="space-y-2">
            {offlineFriends.map((friend) => (
              <Link key={friend.id} href={`/profile/${friend.id}`}>
                <div className="neo-card flex items-center gap-4 hover:bg-[#00FF9C]/10 transition-colors cursor-pointer opacity-75">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-[#1a1a1a] border-2 border-black flex items-center justify-center">
                    {friend.avatar ? (
                      <img src={friend.avatar} alt={friend.username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-gray-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{friend.username}</div>
                    <div className="text-sm text-gray-400">Level {friend.level}</div>
                  </div>

                  {/* Last Active */}
                  <div className="text-sm text-gray-500">{friend.lastActive}</div>

                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {friends.length === 0 && (
        <div className="neo-card text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">No Friends Yet</h3>
          <p className="text-gray-500 mb-4">
            Search for players to add as friends
          </p>
          <Link href="/search" className="neo-button inline-flex">
            <UserPlus className="w-5 h-5 inline-block mr-2" />
            Find Friends
          </Link>
        </div>
      )}
    </div>
  );
}
