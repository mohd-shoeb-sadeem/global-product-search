import React from "react";
import { VideoPlayer } from "@/components/ui/video-player";
import { CardHover } from "@/components/ui/card-hover";
import { type VideoReview as VideoReviewType } from "@shared/schema";

interface VideoReviewProps {
  videoReview: VideoReviewType;
  onWatchFullReview?: (url: string) => void;
}

const VideoReview: React.FC<VideoReviewProps> = ({ videoReview, onWatchFullReview }) => {
  const getVideoUrl = (platform: string, videoId: string): string => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return `https://www.youtube.com/watch?v=${videoId}`;
      case 'vimeo':
        return `https://vimeo.com/${videoId}`;
      case 'tiktok':
        return `https://www.tiktok.com/@${videoReview.channelName}/video/${videoId}`;
      default:
        return videoReview.url;
    }
  };

  const videoUrl = getVideoUrl(videoReview.platform, videoReview.videoId);

  return (
    <CardHover>
      <h3 className="text-lg font-semibold p-4 border-b border-gray-light">Featured Video Review</h3>
      <div className="video-container">
        <VideoPlayer url={videoUrl} title={videoReview.title} light={videoReview.thumbnail} />
      </div>
      <div className="p-4">
        <div className="flex items-start">
          {videoReview.channelAvatar && (
            <img 
              src={videoReview.channelAvatar} 
              alt={videoReview.channelName} 
              className="w-10 h-10 rounded-full mr-3"
            />
          )}
          <div>
            <h4 className="font-medium">{videoReview.title}</h4>
            <div className="flex items-center mt-1">
              <span className="text-sm text-gray-mid">{videoReview.channelName}</span>
              <span className="mx-2 text-xs text-gray-mid">•</span>
              <span className="text-sm text-gray-mid">
                {videoReview.viewCount ? `${formatViewCount(videoReview.viewCount)} views` : ''}
              </span>
            </div>
          </div>
        </div>
        {videoReview.description && (
          <p className="mt-3 text-dark-light">
            {videoReview.description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center">
            <PlatformIcon platform={videoReview.platform} />
            <span className="text-sm">{videoReview.platform}</span>
          </div>
          <button 
            className="text-primary text-sm hover:underline"
            onClick={() => onWatchFullReview && onWatchFullReview(videoReview.url)}
          >
            Watch Full Review
          </button>
        </div>
      </div>
    </CardHover>
  );
};

const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
  switch (platform.toLowerCase()) {
    case 'youtube':
      return <i className="ri-youtube-fill text-error text-xl mr-1"></i>;
    case 'tiktok':
      return <i className="ri-tiktok-fill text-dark text-xl mr-1"></i>;
    case 'vimeo':
      return <i className="ri-vimeo-fill text-blue-600 text-xl mr-1"></i>;
    default:
      return <i className="ri-video-fill text-gray-500 text-xl mr-1"></i>;
  }
};

const formatViewCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else {
    return count.toString();
  }
};

export default VideoReview;
