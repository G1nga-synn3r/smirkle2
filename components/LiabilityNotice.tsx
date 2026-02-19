/**
 * LiabilityNotice Component
 * Displays camera privacy information and user safety disclaimers
 */

'use client';

import { useState } from 'react';
import { AlertTriangle, Camera, Shield, UserCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LIABILITY_NOTICE, MINIMUM_AGE } from '@/lib/types';

interface LiabilityNoticeProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function LiabilityNotice({ isOpen, onAccept, onDecline }: LiabilityNoticeProps) {
  const [isVisible, setIsVisible] = useState(isOpen);

  if (!isVisible) return null;

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
  };

  const handleDecline = () => {
    setIsVisible(false);
    onDecline();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="neo-card max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-black">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-[#FF003C]" />
            <h2 className="text-2xl font-bold uppercase tracking-wider">
              {LIABILITY_NOTICE.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Camera Access */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#00FF9C] border-4 border-black">
              <Camera className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Camera Access Required</h3>
              <p className="text-sm text-gray-300">{LIABILITY_NOTICE.cameraAccess}</p>
            </div>
          </div>

          {/* Data Storage */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#00FF9C] border-4 border-black">
              <Shield className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Data Privacy</h3>
              <p className="text-sm text-gray-300">{LIABILITY_NOTICE.dataStorage}</p>
              <p className="text-sm text-gray-300 mt-1">{LIABILITY_NOTICE.thirdPartySharing}</p>
            </div>
          </div>

          {/* Age Restriction */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#FF003C] border-4 border-black">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Age Restriction</h3>
              <p className="text-sm text-gray-300">
                {LIABILITY_NOTICE.ageRestriction} (You must be {MINIMUM_AGE} years or older)
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-black border-4 border-[#FF003C]">
            <p className="text-sm text-gray-300 italic">
              {LIABILITY_NOTICE.disclaimer}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-4 border-t-4 border-black flex gap-4">
          <button
            onClick={handleDecline}
            className="neo-button flex-1 neo-button--outline"
          >
            <X className="w-5 h-5 mr-2" />
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="neo-button flex-1"
          >
            <Shield className="w-5 h-5 mr-2" />
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export default LiabilityNotice;
