'use client';

import { useState } from 'react';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Lock, 
  Globe, 
  Users,
  Trophy,
  Star,
  Camera,
  MapPin,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserProfileDetails, VisibilitySetting } from '@/lib/types';

// Mock current user data
const CURRENT_USER = {
  id: 'current-user',
  username: 'CurrentPlayer',
  level: 25,
  highScore: 15840,
  lifetimeScore: 245000,
  profile: {
    fullName: 'John Doe',
    birthdate: new Date('1990-05-15'),
    avatar: '',
    slogan: 'Keep a straight face!',
    location: 'New York, USA',
    visibility: {
      fullName: 'public' as VisibilitySetting,
      birthdate: 'friends' as VisibilitySetting,
      avatar: 'public' as VisibilitySetting,
      slogan: 'public' as VisibilitySetting,
      location: 'public' as VisibilitySetting,
    }
  }
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfileDetails>(CURRENT_USER.profile);
  const [editedProfile, setEditedProfile] = useState<UserProfileDetails>(CURRENT_USER.profile);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    setSelectedField(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedField(null);
  };

  const handleFieldChange = (field: keyof UserProfileDetails, value: string | Date | null) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVisibilityChange = (field: keyof UserProfileDetails['visibility'], value: VisibilitySetting) => {
    setEditedProfile(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [field]: value
      }
    }));
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const getVisibilityIcon = (visibility: VisibilitySetting) => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'friends': return <Users className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
    }
  };

  const renderField = (fieldKey: keyof UserProfileDetails, label: string, icon: React.ReactNode) => {
    const isVisible = isEditing 
      ? true 
      : profile.visibility[fieldKey as keyof typeof profile.visibility] !== 'private';

    if (!isVisible && !isEditing) return null;

    const visibilityKey = fieldKey as keyof typeof profile.visibility;
    const currentVisibility = profile.visibility[visibilityKey];
    const editedVisibility = editedProfile.visibility[visibilityKey];

    return (
      <div className="border-b border-black/30 py-3">
        {isEditing ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#00FF9C]">
              {icon}
              <span className="font-bold">{label}</span>
            </div>
            <input
              type={fieldKey === 'birthdate' ? 'date' : 'text'}
              value={fieldKey === 'birthdate' 
                ? formatDate(editedProfile[fieldKey] as Date | null)
                : (editedProfile[fieldKey] as string || '')}
              onChange={(e) => handleFieldChange(fieldKey, e.target.value)}
              className="neo-input w-full"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Visibility:</span>
              <div className="flex gap-1">
                {(['public', 'friends', 'private'] as VisibilitySetting[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => handleVisibilityChange(visibilityKey, v)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 text-xs font-bold border-2 border-black",
                      editedVisibility === v 
                        ? "bg-[#00FF9C] text-black" 
                        : "bg-[#1a1a1a] text-gray-400 hover:bg-[#00FF9C]/20"
                    )}
                  >
                    {getVisibilityIcon(v)}
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="text-gray-500 mt-1">{icon}</div>
            <div className="flex-1">
              <div className="text-sm text-gray-400">{label}</div>
              <div className="font-bold">
                {fieldKey === 'birthdate' 
                  ? formatDate(profile[fieldKey] as Date | null)
                  : (profile[fieldKey] as string || 'Not set')}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                {getVisibilityIcon(currentVisibility)}
                {currentVisibility.charAt(0).toUpperCase() + currentVisibility.slice(1)}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white p-4 pb-24">
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
          <div className="relative">
            <div className="w-24 h-24 bg-[#1a1a1a] border-4 border-black flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-500" />
              )}
            </div>
            {isEditing && (
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#00FF9C] border-2 border-black flex items-center justify-center">
                <Camera className="w-4 h-4 text-black" />
              </button>
            )}
          </div>
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold">{CURRENT_USER.username}</div>
            <div className="text-[#00FF9C]">Level {CURRENT_USER.level}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-black/50 p-4 border-2 border-black">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Trophy className="w-4 h-4" />
              High Score
            </div>
            <div className="font-bold text-xl text-[#00FF9C]">{CURRENT_USER.highScore.toLocaleString()}</div>
          </div>
          <div className="bg-black/50 p-4 border-2 border-black">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Star className="w-4 h-4" />
              Lifetime
            </div>
            <div className="font-bold text-xl text-[#00FF9C]">{CURRENT_USER.lifetimeScore.toLocaleString()}</div>
          </div>
        </div>

        {/* Edit/View Toggle */}
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="neo-button w-full mb-6"
          >
            <Edit3 className="w-5 h-5 inline-block mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2 mb-6">
            <button
              onClick={handleSave}
              className="neo-button flex-1"
            >
              <Save className="w-5 h-5 inline-block mr-2" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="neo-button neo-button--red flex-1"
            >
              <X className="w-5 h-5 inline-block mr-2" />
              Cancel
            </button>
          </div>
        )}

        {/* Profile Fields */}
        <div className="space-y-1">
          {renderField('fullName', 'Full Name', <User className="w-4 h-4" />)}
          {renderField('birthdate', 'Birthdate', <Calendar className="w-4 h-4" />)}
          {renderField('slogan', 'Slogan', <MessageSquare className="w-4 h-4" />)}
          {renderField('location', 'Location', <MapPin className="w-4 h-4" />)}
        </div>
      </div>

      {/* System Fields (Read-only) */}
      <div className="neo-card mt-4 opacity-75">
        <h3 className="font-bold text-gray-400 mb-3">System Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Username</span>
            <span className="font-bold">{CURRENT_USER.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Level</span>
            <span className="font-bold">{CURRENT_USER.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">High Score</span>
            <span className="font-bold">{CURRENT_USER.highScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Lifetime Score</span>
            <span className="font-bold">{CURRENT_USER.lifetimeScore.toLocaleString()}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 italic">
          These fields are system-generated and cannot be modified.
        </p>
      </div>
    </div>
  );
}
