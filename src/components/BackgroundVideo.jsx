import { useEffect, useRef, useState } from 'react';

function BackgroundVideo({ className, src, poster }) {
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !('IntersectionObserver' in window)) {
      setShouldLoad(true);
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = entry.isIntersecting;
        setIsVisible(nextVisible);

        if (nextVisible) {
          setShouldLoad(true);
        }
      },
      { rootMargin: '220px 0px', threshold: 0.01 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    if (!shouldLoad) {
      video.pause();
      return undefined;
    }

    const syncPlayback = () => {
      if (document.hidden || !isVisible) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    syncPlayback();
    document.addEventListener('visibilitychange', syncPlayback);

    return () => document.removeEventListener('visibilitychange', syncPlayback);
  }, [shouldLoad, isVisible]);

  return (
    <video
      ref={videoRef}
      className={`${className} ${isLoaded ? 'is-loaded' : ''}`}
      src={shouldLoad ? src : undefined}
      poster={poster}
      autoPlay
      muted
      defaultMuted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      onLoadedData={() => setIsLoaded(true)}
      onCanPlay={() => setIsLoaded(true)}
    />
  );
}

export default BackgroundVideo;
