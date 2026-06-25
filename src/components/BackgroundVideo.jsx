import { useEffect, useRef, useState } from 'react';

function BackgroundVideo({ className, src }) {
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !('IntersectionObserver' in window)) {
      setShouldLoad(true);
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = entry.isIntersecting && entry.intersectionRatio >= 0.12;
        setIsVisible(nextVisible);
        setShouldLoad(nextVisible);
      },
      { threshold: 0.12 }
    );

    observer.observe(video);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    if (!shouldLoad) {
      video.pause();
      video.removeAttribute('src');
      video.load();
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
      className={className}
      src={shouldLoad ? src : undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    />
  );
}

export default BackgroundVideo;