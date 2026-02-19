'use client';

import { useState } from 'react';
import { Search, User, X, Check, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface SearchResult {
  id: string;
  username: string;
  realName?: string;
  avatar?: string;
  level: number;
  friendStatus: 'none' | 'pending' | 'friends';
}

const MOCK_SEARCH_RESULTS: SearchResult[] = [
  { id: '1', username: 'PokerKing', realName: 'John Smith', level: 45, friendStatus: 'none' },
  { id: '2', username: 'StoneFace', realName: 'Jane Doe', level: 32, friendStatus: 'pending' },
  { id: '3', username: 'NoLaughZone', realName: 'Bob Johnson', level: 28, friendStatus: 'friends' },
  { id: '4', username: 'CoolCat42', realName: 'Alice Brown', level: 19, friendStatus: 'none' },
  { id: '5', username: 'DeadpanPro', realName: 'Charlie Wilson', level: 55, friendStatus: 'none' },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real app, this would query the database
      setSearchResults(MOCK_SEARCH_RESULTS.filter(
        r => r.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
             (r.realName && r.realName.toLowerCase().includes(searchQuery.toLowerCase()))
      ));
      setHasSearched(true);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleFriendAction = (userId: string, currentStatus: string) => {
    // In a real app, this would send a friend request
    setSearchResults(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          friendStatus: currentStatus === 'none' ? 'pending' : 
                       currentStatus === 'pending' ? 'none' : 'friends'
        };
      }
      return user;
    }));
  };

  const getFriendButtonText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'friends': return 'Friends';
      default: return 'Add Friend';
    }
  };

  const getFriendButtonIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'friends': return <Check className="w-4 h-4" />;
      default: return <UserPlus className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#00FF9C] glow-mint flex items-center justify-center gap-3">
          <Search className="w-8 h-8" />
          SEARCH PLAYERS
        </h1>
        <p className="text-gray-400 mt-2">Find friends by username or real name</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username or real name..."
            className="neo-input w-full pr-12"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="neo-button w-full mt-4"
        >
          <Search className="w-5 h-5 inline-block mr-2" />
          Search
        </button>
      </form>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold text-[#00FF9C] mb-4">
            {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'} Found
          </h2>
          
          {searchResults.length === 0 ? (
            <div className="neo-card text-center py-8">
              <User className="w-12 h-12 mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">No players found matching &ldquo;{searchQuery}&rdquo;</p>
            </div>
          ) : (
            searchResults.map((result) => (
              <Link
                key={result.id}
                href={`/profile/${result.id}`}
                className="block"
              >
                <div className="neo-card flex items-center gap-4 hover:bg-[#00FF9C]/10 transition-colors cursor-pointer">
                  {/* Avatar */}
                  <div className="w-14 h-14 bg-[#1a1a1a] border-2 border-black flex-shrink-0 flex items-center justify-center">
                    {result.avatar ? (
                      <img src={result.avatar} alt={result.username} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-gray-500" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg truncate">{result.username}</div>
                    {result.realName && (
                      <div className="text-sm text-gray-400 truncate">{result.realName}</div>
                    )}
                    <div className="text-xs text-[#00FF9C]">Level {result.level}</div>
                  </div>

                  {/* Friend Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFriendAction(result.id, result.friendStatus);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 font-bold text-sm border-2 border-black transition-all",
                      result.friendStatus === 'friends' && "bg-[#00FF9C] text-black",
                      result.friendStatus === 'pending' && "bg-yellow-600 text-white",
                      result.friendStatus === 'none' && "bg-[#1a1a1a] text-[#00FF9C] hover:bg-[#00FF9C] hover:text-black"
                    )}
                    disabled={result.friendStatus === 'friends'}
                  >
                    {getFriendButtonIcon(result.friendStatus)}
                    {getFriendButtonText(result.friendStatus)}
                  </button>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasSearched && (
        <div className="neo-card text-center py-12">
          <Search className="w-16 h-16 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-gray-400 mb-2">Search for Players</h3>
          <p className="text-gray-500">
            Enter a username or real name to find other players
          </p>
        </div>
      )}
    </div>
  );
}

function Clock({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
