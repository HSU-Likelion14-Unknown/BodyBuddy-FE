import { useCallback, useEffect, useRef, useState } from 'react';

export function useCamera(enabled) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [status, setStatus] = useState('idle');
  const [facingMode, setFacingMode] = useState('environment');
  const [retryCount, setRetryCount] = useState(0);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isTorchChanging, setIsTorchChanging] = useState(false);
  const [torchError, setTorchError] = useState('');

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
      setTorchSupported(false);
      setTorchEnabled(false);
      setIsTorchChanging(false);
      setTorchError('');

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

        const videoTrack = stream.getVideoTracks()[0];
        let torchCapability;

        try {
          torchCapability = videoTrack?.getCapabilities?.().torch;
        } catch {
          torchCapability = undefined;
        }

        const canToggleTorch = Array.isArray(torchCapability)
          ? torchCapability.includes(true) && torchCapability.includes(false)
          : torchCapability === true;

        setTorchSupported(canToggleTorch);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        if (cancelled || streamRef.current !== stream) return;

        setStatus('ready');
      } catch (error) {
        if (cancelled) return;

        if (
          error.name === 'NotAllowedError' ||
          error.name === 'SecurityError'
        ) {
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

  const toggleTorch = useCallback(async () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];

    if (
      !torchSupported ||
      !videoTrack ||
      videoTrack.readyState !== 'live' ||
      isTorchChanging
    ) {
      return false;
    }

    const nextTorchEnabled = !torchEnabled;
    setIsTorchChanging(true);
    setTorchError('');

    try {
      await videoTrack.applyConstraints({
        advanced: [{ torch: nextTorchEnabled }],
      });

      if (streamRef.current?.getVideoTracks()[0] !== videoTrack) return false;

      setTorchEnabled(nextTorchEnabled);
      return true;
    } catch {
      if (streamRef.current?.getVideoTracks()[0] === videoTrack) {
        setTorchError('이 기기에서는 플래시를 전환할 수 없어요.');
      }

      return false;
    } finally {
      if (streamRef.current?.getVideoTracks()[0] === videoTrack) {
        setIsTorchChanging(false);
      }
    }
  }, [isTorchChanging, torchEnabled, torchSupported]);

  return {
    videoRef,
    status,
    torchSupported: enabled && torchSupported,
    torchEnabled: enabled && torchEnabled,
    isTorchChanging: enabled && isTorchChanging,
    torchError: enabled ? torchError : '',
    capturePhoto,
    toggleTorch,
    retryCamera: () => setRetryCount((count) => count + 1),
    switchCamera: () =>
      setFacingMode((currentMode) =>
        currentMode === 'environment' ? 'user' : 'environment',
      ),
  };
}
