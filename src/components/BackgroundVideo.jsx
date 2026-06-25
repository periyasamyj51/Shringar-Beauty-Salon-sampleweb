import { useCallback, useEffect, useRef, useState } from 'react';

function BackgroundVideo({ className, src, poster }) {
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const prepareVideo = useCallback(() => {
    const video = videoRef.current;

    if (!video) {
      return null;
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    return video;
  }, []);

  const playWhenReady = useCallback(() => {
    const video = prepareVideo();

    if (!video || document.hidden || !isVisible || !shouldLoad) {
      return;
    }

    video.play().catch(() => {});
  }, [isVisible, prepareVideo, shouldLoad]);

  useEffect(() => {
    const video = prepareVideo();

    if (!video || !('IntersectionObserver' in window)) {
      const frame = window.requestAnimationFrame(() => {
        setShouldLoad(true);
        setIsVisible(true);
      });

      return () => window.cancelAnimationFrame(frame);
    }

    const observedElement = video.parentElement || video;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = entry.isIntersecting;
        setIsVisible(nextVisible);

        if (nextVisible) {
          setShouldLoad(true);
        }
      },
      { rootMargin: '320px 0px', threshold: 0.01 }
    );

    observer.observe(observedElement);

    return () => observer.disconnect();
  }, [prepareVideo]);

  useEffect(() => {
    const video = prepareVideo();

    if (!video) {
      return undefined;
    }

    if (!shouldLoad) {
      video.pause();
      return undefined;
    }

    const syncPlayback = () => {
      if (document.hidden || !isVisible) {
        video.pause();
        return;
      }

      playWhenReady();
    };

    syncPlayback();

    video.addEventListener('loadedmetadata', playWhenReady);
    video.addEventListener('loadeddata', playWhenReady);
    video.addEventListener('canplay', playWhenReady);
    window.addEventListener('pageshow', playWhenReady);
    window.addEventListener('focus', playWhenReady);
    document.addEventListener('visibilitychange', syncPlayback);
    document.addEventListener('touchstart', playWhenReady, { passive: true });

    return () => {
      video.removeEventListener('loadedmetadata', playWhenReady);
      video.removeEventListener('loadeddata', playWhenReady);
      video.removeEventListener('canplay', playWhenReady);
      window.removeEventListener('pageshow', playWhenReady);
      window.removeEventListener('focus', playWhenReady);
      document.removeEventListener('visibilitychange', syncPlayback);
      document.removeEventListener('touchstart', playWhenReady);
    };
  }, [isVisible, playWhenReady, prepareVideo, shouldLoad]);

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
