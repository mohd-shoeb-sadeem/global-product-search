import React, { useState } from "react";
import ReactPlayer from "react-player/lazy";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoPlayerProps {
  url: string;
  title?: string;
  light?: string | boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function VideoPlayer({
  url,
  title = "Video Player",
  light = false,
  width = "100%",
  height = "100%",
  className,
}: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleReady = () => {
    setIsReady(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {!isReady && !hasError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      
      {hasError ? (
        <div className="bg-gray-100 rounded-lg p-6 text-center text-gray-500 flex flex-col items-center justify-center" style={{ width, height: typeof height === 'number' ? height : '240px' }}>
          <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Video cannot be loaded</p>
        </div>
      ) : (
        <div className="video-container">
          <ReactPlayer
            url={url}
            light={light}
            width={width}
            height={height}
            controls
            playing={false}
            onReady={handleReady}
            onError={handleError}
            title={title}
            config={{
              youtube: {
                playerVars: { 
                  origin: window.location.origin,
                  modestbranding: 1,
                  rel: 0
                }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
