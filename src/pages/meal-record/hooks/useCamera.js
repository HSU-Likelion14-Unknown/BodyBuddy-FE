import { useCallback, useEffect, useRef, useState } from 'react';

export function useCamera(enabled) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [facingMode, setFacingMode] = useState('environment');
  const [retryCount, setRetryCount] = useState(0);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopCamera();
      return undefined;
    }

    let cancelled = false;

    const openCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported');
        return;
      }

      setStatus('requesting');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: facingMode },
          },
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        setStatus('ready');
      } catch (error) {
        if (cancelled) return;

        if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
          setStatus('denied');
        } else {
          setStatus('error');
        }
      }
    };

    openCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [enabled, facingMode, retryCount, stopCamera]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;

    if (!video?.videoWidth || !video.videoHeight) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.9);
  }, []);

  return {
    videoRef,
    status,
    capturePhoto,
    retryCamera: () => setRetryCount((count) => count + 1),
    switchCamera: () =>
      setFacingMode((currentMode) =>
        currentMode === 'environment' ? 'user' : 'environment',
      ),
  };
}
