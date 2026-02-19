'use client';

import { useState, useEffect } from 'react';
import { Upload, Video, AlertCircle, Check, Clock, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoSubmission {
  youtubeUrl: string;
  title: string;
  description: string;
}

export default function SubmitPage() {
  const [formData, setFormData] = useState<VideoSubmission>({
    youtubeUrl: '',
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateYouTubeUrl = (url: string): boolean => {
    const patterns = [
      /^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+/,
      /^https:\/\/youtu\.be\/[\w-]+/,
      /^https:\/\/www\.youtube\.com\/embed\/[\w-]+/,
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.youtubeUrl.trim()) {
      newErrors.youtubeUrl = 'YouTube URL is required';
    } else if (!validateYouTubeUrl(formData.youtubeUrl)) {
      newErrors.youtubeUrl = 'Please enter a valid YouTube URL';
    }
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    // Simulate submission (in a real app, this would send to backend)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ youtubeUrl: '', title: '', description: '' });
    }, 1500);
  };

  const handleChange = (field: keyof VideoSubmission, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white p-4 pb-24">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#00FF9C] glow-mint flex items-center justify-center gap-3">
          <Upload className="w-8 h-8" />
          SUBMIT VIDEO
        </h1>
        <p className="text-gray-400 mt-2">Share funny videos for the challenge</p>
      </div>

      {/* Info Box */}
      <div className="neo-card mb-6 bg-[#00FF9C]/10 border-[#00FF9C]">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-[#00FF9C] flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-[#00FF9C] mb-1">Submission Guidelines</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Videos must be appropriate for all ages</li>
              <li>• No copyrighted content</li>
              <li>• All submissions are reviewed before approval</li>
              <li>• YouTube links only</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="neo-card mb-6 bg-green-900/30 border-green-500">
          <div className="flex items-center gap-3">
            <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-green-500">Submission Received!</h3>
              <p className="text-sm text-gray-400">
                Your video has been submitted for review. You&apos;ll be notified when it&apos;s approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* YouTube URL */}
        <div>
          <label className="block text-sm font-bold text-[#00FF9C] mb-2">
            <LinkIcon className="w-4 h-4 inline-block mr-1" />
            YouTube URL *
          </label>
          <input
            type="text"
            value={formData.youtubeUrl}
            onChange={(e) => handleChange('youtubeUrl', e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="neo-input w-full"
            aria-label="YouTube URL"
            aria-invalid={!!errors.youtubeUrl}
            aria-describedby={errors.youtubeUrl ? "youtube-url-error" : undefined}
          />
          {errors.youtubeUrl && (
            <p id="youtube-url-error" className="text-red-500 text-sm mt-1" role="alert">{errors.youtubeUrl}</p>
          )}
          {formData.youtubeUrl && !errors.youtubeUrl && validateYouTubeUrl(formData.youtubeUrl) && (
            <div className="mt-2">
              <p className="text-sm text-gray-400 mb-2">Preview:</p>
              <div className="aspect-video bg-black border-2 border-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${extractVideoId(formData.youtubeUrl)}`}
                  title={`Preview of ${formData.title || 'YouTube video'}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  aria-label={`Preview of video: ${formData.title || 'YouTube video'}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-bold text-[#00FF9C] mb-2">
            <Video className="w-4 h-4 inline-block mr-1" />
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter video title..."
            className="neo-input w-full"
            aria-label="Video title"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <p id="title-error" className="text-red-500 text-sm mt-1" role="alert">{errors.title}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-[#00FF9C] mb-2">
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the video..."
            rows={4}
            className="neo-input w-full resize-none"
            aria-label="Video description"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "description-error" : undefined}
          />
          {errors.description && (
            <p id="description-error" className="text-red-500 text-sm mt-1" role="alert">{errors.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "neo-button w-full",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <>
              <Clock className="w-5 h-5 inline-block mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 inline-block mr-2" />
              Submit for Review
            </>
          )}
        </button>
      </form>

      {/* Status Note */}
      <div className="mt-6 p-4 bg-[#1a1a1a] border-2 border-black">
        <h3 className="font-bold text-gray-400 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Review Process
        </h3>
        <p className="text-sm text-gray-500">
          All video submissions go through an approval process before being added to the library. 
          This helps ensure all content is appropriate for the challenge. You&apos;ll receive a notification 
          once your video has been reviewed.
        </p>
      </div>
    </div>
  );
}
