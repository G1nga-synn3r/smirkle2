'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Camera, Video, AlertTriangle, Volume2, VolumeX, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock video data
const SAMPLE_VIDEOS = [
  { id: '1', title: 'Funny Cat Compilation', thumbnail: 'https://picsum.photos/seed/cat1/400/300' },
  { id: '2', title: 'Kids Saying Funny Things', thumbnail: 'https://picsum.photos/seed/kids2/400/300' },
  { id: '3', title: 'Pet Fails 2024', thumbnail: 'https://picsum.photos/seed/pets3/400/300' },
];

export default function HomePage() {
  const [isReady, setIsReady] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(SAMPLE_VIDEOS[0]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera
  useEffect(() => {
    let stream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' },
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraActive(true);
      } catch (err) {
        console.error('Camera error:', err);
        setCameraActive(false);
      }
    };

    if (isReady) {
      initCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isReady]);

  // Video loop simulation
  useEffect(() => {
    if (videoActive && !isMuted) {
      const interval = setInterval(() => {
        // Simulate video playing
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [videoActive, isMuted]);

  const handleReady = () => {
    setIsReady(true);
    setVideoActive(true);
  };

  const handleStop = () => {
    setIsReady(false);
    setVideoActive(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Main Content */}
      <div className="p-4 pb-28">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-[#00FF9C] glow-mint">
            SMIRKLE2
          </h1>
          <p className="text-gray-400 text-sm">Don't Laugh Challenge</p>
        </div>

        {/* Instructions Banner */}
        <div className="neo-card mb-4 bg-yellow-900/30 border-yellow-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            <div className="text-center flex-1">
              <p className="font-bold text-yellow-500 text-lg">
                Eyes open! Straight face! No smiling!
              </p>
            </div>
          </div>
        </div>

        {/* Split Screen Interface */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Video Preview Window */}
          <div className="neo-card p-0 overflow-hidden">
            <div className="bg-black aspect-video relative">
              {/* Video Display */}
              {videoActive ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                  {/* Simulated video content */}
                  <div className="text-center p-4">
                    <Video className="w-16 h-16 mx-auto text-[#00FF9C] mb-2 animate-pulse" />
                    <p className="text-[#00FF9C] font-bold">{selectedVideo.title}</p>
                    <p className="text-gray-400 text-sm mt-2">Video playing...</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                  <div className="text-center">
                    <Video className="w-16 h-16 mx-auto text-gray-600 mb-2" />
                    <p className="text-gray-500">Select a video to preview</p>
                  </div>
                </div>
              )}

              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className="absolute top-2 right-2 w-8 h-8 bg-black/70 border border-black flex items-center justify-center hover:bg-black"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-white" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </button>

              {/* Video Label */}
              <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 text-xs font-bold">
                VIDEO PREVIEW
              </div>
            </div>

            {/* Video Selection */}
            <div className="p-2 bg-[#1a1a1a]">
              <p className="text-xs text-gray-400 mb-2">Select video:</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {SAMPLE_VIDEOS.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={cn(
                      "flex-shrink-0 w-20 h-14 bg-black border-2 overflow-hidden",
                      selectedVideo.id === video.id ? "border-[#00FF9C]" : "border-transparent opacity-50"
                    )}
                  >
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Camera Window */}
          <div className="neo-card p-0 overflow-hidden">
            <div className="bg-black aspect-video relative">
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 mx-auto text-gray-600 mb-2" />
                    <p className="text-gray-500">Camera inactive</p>
                    <p className="text-gray-600 text-xs mt-1">Press READY to start</p>
                  </div>
                </div>
              )}

              {/* Camera Status Indicator */}
              {cameraActive && (
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold">LIVE</span>
                </div>
              )}

              {/* Camera Label */}
              <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 text-xs font-bold">
                YOUR FACE
              </div>
            </div>

            {/* Camera Info */}
            <div className="p-3 bg-[#1a1a1a] text-center">
              <p className="text-sm text-gray-400">
                Make sure your face is visible and well-lit
              </p>
            </div>
          </div>
        </div>

        {/* Hidden Canvas for Face Detection */}
        <canvas ref={canvasRef} className="hidden" width={640} height={480} />

        {/* Ready Button */}
        <div className="fixed bottom-20 left-0 right-0 px-4 z-30">
          {!isReady ? (
            <button
              onClick={handleReady}
              className="w-full py-6 text-2xl font-bold uppercase tracking-wider
                bg-[#FF003C] text-white border-4 border-black
                shadow-[0_0_30px_rgba(255,0,60,0.5)]
                hover:bg-red-600 hover:shadow-[0_0_50px_rgba(255,0,60,0.8)]
                active:scale-95 transition-all duration-200
                clip-path-polygon:polygon(5% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 100%, 0% 15%)"
              style={{
                clipPath: 'polygon(5% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 100%, 0% 15%)'
              }}
            >
              <Play className="w-8 h-8 inline-block mr-3" />
              READY!
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="w-full py-4 text-xl font-bold uppercase tracking-wider
                bg-[#1a1a1a] text-[#FF003C] border-4 border-[#FF003C]
                hover:bg-[#FF003C] hover:text-white
                transition-all duration-200"
              style={{
                clipPath: 'polygon(5% 0%, 100% 0%, 100% 85%, 95% 100%, 0% 100%, 0% 15%)'
              }}
            >
              STOP
            </button>
          )}
        </div>

        {/* Game Status */}
        {isReady && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF9C]/20 border border-[#00FF9C]">
              <div className="w-2 h-2 bg-[#00FF9C] rounded-full animate-pulse"></div>
              <span className="text-[#00FF9C] font-bold">Game ready! Keep a straight face!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
