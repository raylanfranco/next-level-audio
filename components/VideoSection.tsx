'use client';

import VideoLightbox from './VideoLightbox';

interface Video {
  id: string;
  title: string;
  thumbnail?: string;
}

interface VideoSectionProps {
  videos?: Video[];
  defaultVideoId?: string;
  defaultVideoTitle?: string;
}

export default function VideoSection({
  videos,
  defaultVideoId = 'dQw4w9WgXcQ', // Classic rickroll fallback 😄
  defaultVideoTitle = 'Watch Our Work',
}: VideoSectionProps) {
  // Use provided videos or default single video
  const displayVideos = videos && videos.length > 0 
    ? videos 
    : [{ id: defaultVideoId, title: defaultVideoTitle || 'Watch Our Work' }];

  return (
    <section className="py-20 md:py-32 bg-black relative overflow-hidden border-t-2 border-[#00A0E0]/30">
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 neon-glow" style={{ fontFamily: 'var(--font-oxanium)' }}>
            SEE US IN ACTION
          </h2>
          <p className="text-[#00A0E0]/80 max-w-2xl mx-auto text-lg font-mono">
            Watch our expert technicians transform vehicles with premium installations and services
          </p>
        </div>

        {displayVideos.length === 1 ? (
          // Single video - larger display
          <div className="max-w-4xl mx-auto">
            <VideoLightbox
              videoId={displayVideos[0].id}
              thumbnail={displayVideos[0].thumbnail}
              title={displayVideos[0].title}
            />
          </div>
        ) : (
          // Multiple videos - grid layout
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayVideos.map((video) => (
              <VideoLightbox
                key={video.id}
                videoId={video.id}
                thumbnail={video.thumbnail}
                title={video.title}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

