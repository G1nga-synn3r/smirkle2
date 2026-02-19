'use client';

import { useState, use } from 'react';
import { 
  User, 
  Trophy, 
  Star, 
  MapPin, 
  MessageSquare, 
  Calendar,
  Lock,
  Globe,
  Users,
  UserPlus,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { VisibilitySetting } from '@/lib/types';

// Mock user data - in a real app this would be fetched based on the ID
const getMockUser = (id: string) => {
  const users: Record<string, {
    id: string;
    username: string;
    level: number;
    highScore: number;
    lifetimeScore: number;
    isFriend: boolean;
    hasPendingRequest: boolean;
    profile: {
      fullName: string;
      birthdate: Date | null;
      avatar: string;
      slogan: string;
      location: string;
      visibility: {
        fullName: VisibilitySetting;
        birthdate: VisibilitySetting;
        slogan: VisibilitySetting;
        location: VisibilitySetting;
      };
    };
  }> = {
    '1': {
      id: '1',
      username: 'PokerKing',
      level: 45,
      highScore: 15840,
      lifetimeScore: 245000,
      isFriend: false,
      hasPendingRequest: false,
      profile: {
        fullName: 'John Smith',
        birthdate: new Date('1990-05-15'),
        avatar: '',
        slogan: 'Keep a straight face!',
        location: 'New York, USA',
        visibility: {
          fullName: 'public',
          birthdate: 'friends',
          slogan: 'public',
          location: 'public',
        }
      }
    },
    '2': {
      id: '2',
      username: 'StoneFace',
      level: 32,
      highScore: 12450,
      lifetimeScore: 156000,
      isFriend: true,
      hasPendingRequest: false,
      profile: {
        fullName: 'Jane Doe',
        birthdate: new Date('1985-08-22'),
        avatar: '',
        slogan: 'No laughing matter',
        location: 'Los Angeles, CA',
        visibility: {
          fullName: 'public',
          birthdate: 'private',
          slogan: 'public',
          location: 'friends',
        }
      }
    },
    '3': {
      id: '3',
      username: 'NoLaughZone',
      level: 28,
      highScore: 11200,
      lifetimeScore: 98000,
      isFriend: false,
      hasPendingRequest: true,
      profile: {
        fullName: 'Bob Johnson',
        birthdate: null,
        avatar: '',
        slogan: '',
        location: '',
        visibility: {
          fullName: 'public',
          birthdate: 'private',
          slogan: 'private',
          location: 'private',
        }
      }
    },
  };

  return users[id] || {
    id,
    username: 'UnknownPlayer',
    level: 1,
    highScore: 0,
    lifetimeScore: 0,
    isFriend: false,
    hasPendingRequest: false,
    profile: {
      fullName: '',
      birthdate: null,
      avatar: '',
      slogan: '',
      location: '',
      visibility: {
        fullName: 'private',
        birthdate: 'private',
        slogan: 'private',
        location: 'private',
      }
    }
  };
};

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user] = useState(() => getMockUser(id));
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'friends'>(
    user.isFriend ? 'friends' : user.hasPendingRequest ? 'pending' : 'none'
  );

  const handleFriendAction = () => {
    // In a real app, this would send a request to the backend
    setFriendStatus(prev => {
      if (prev === 'none') return 'pending';
      if (prev === 'pending') return 'none';
      return 'friends';
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getVisibilityIcon = (visibility: VisibilitySetting) => {
    switch (visibility) {
      case 'public': return <Globe className="w-3 h-3" />;
      case 'friends': return <Users className="w-3 h-3" />;
      case 'private': return <Lock className="w-3 h-3" />;
    }
  };

  const isFieldVisible = (visibility: VisibilitySetting) => {
    return visibility !== 'private';
  };

  const canViewField = (visibility: VisibilitySetting) => {
    // Can always see public fields
    if (visibility === 'public') return true;
    // Can see friends-only fields if we are friends
    if (visibility === 'friends' && friendStatus === 'friends') return true;
    return false;
  };

  const renderField = (
    fieldKey: 'fullName' | 'birthdate' | 'slogan' | 'location',
    label: string,
    icon: React.ReactNode,
    value: string | Date | null
  ) => {
    const visibility = user.profile.visibility[fieldKey];
    const isVisible = canViewField(visibility);

    if (!isVisible) return null;

    return (
      <div className="border-b border-black/30 py-3">
        <div className="flex items-start gap-3">
          <div className="text-gray-500 mt-1">{icon}</div>
          <div className="flex-1">
            <div className="text-sm text-gray-400">{label}</div>
            <div className="font-bold">
              {fieldKey === 'birthdate' ? formatDate(value as Date | null) : (value as string || 'Not set')}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              {getVisibilityIcon(visibility)}
              <span>{visibility === 'public' ? 'Public' : visibility === 'friends' ? 'Friends' : 'Private'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white p-4 pb-24">
      {/* Back Button */}
      <Link href="/search" className="inline-flex items-center gap-2 text-[#00FF9C] mb-4">
        ← Back to Search
      </Link>

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#00FF9C] glow-mint flex items-center justify-center gap-3">
          <User className="w-8 h-8" />
          PROFILE
        </h1>
      </div>

      {/* Profile Card */}
      <div className="neo-card">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-[#1a1a1a] border-4 border-black flex items-center justify-center">
            {user.profile.avatar ? (
              <img src={user.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-gray-500" />
            )}
          </div>
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold">{user.username}</div>
            <div className="text-[#00FF9C]">Level {user.level}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/50 p-4 border-2 border-black">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Trophy className="w-4 h-4" />
              High Score
            </div>
            <div className="font-bold text-xl text-[#00FF9C]">{user.highScore.toLocaleString()}</div>
          </div>
          <div className="bg-black/50 p-4 border-2 border-black">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Star className="w-4 h-4" />
              Lifetime
            </div>
            <div className="font-bold text-xl text-[#00FF9C]">{user.lifetimeScore.toLocaleString()}</div>
          </div>
        </div>

        {/* Action Button */}
        {friendStatus === 'friends' ? (
          <div className="neo-button bg-[#00FF9C] text-black w-full mb-6 cursor-default">
            <Check className="w-5 h-5 inline-block mr-2" />
            Friends
          </div>
        ) : friendStatus === 'pending' ? (
          <button
            onClick={handleFriendAction}
            className="neo-button bg-yellow-600 text-white w-full mb-6"
            disabled
          >
            Request Pending
          </button>
        ) : (
          <button
            onClick={handleFriendAction}
            className="neo-button w-full mb-6"
          >
            <UserPlus className="w-5 h-5 inline-block mr-2" />
            Add Friend
          </button>
        )}

        {/* Profile Fields */}
        <div className="space-y-1">
          {renderField('fullName', 'Full Name', <User className="w-4 h-4" />, user.profile.fullName)}
          {renderField('birthdate', 'Birthdate', <Calendar className="w-4 h-4" />, user.profile.birthdate)}
          {renderField('slogan', 'Slogan', <MessageSquare className="w-4 h-4" />, user.profile.slogan)}
          {renderField('location', 'Location', <MapPin className="w-4 h-4" />, user.profile.location)}
        </div>

        {/* Empty State for Private Profile */}
        {user.profile.fullName === '' && user.profile.slogan === '' && user.profile.location === '' && (
          <div className="text-center py-8">
            <Lock className="w-12 h-12 mx-auto text-gray-600 mb-2" />
            <p className="text-gray-500">This profile is private</p>
            <p className="text-gray-600 text-sm">Add as friend to see more info</p>
          </div>
        )}
      </div>
    </div>
  );
}
