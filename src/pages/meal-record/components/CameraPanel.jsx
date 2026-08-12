import { useRef, useState } from 'react';
import {
  MdCameraswitch,
  MdFlashOff,
  MdOutlinePhotoLibrary,
} from 'react-icons/md';
import { useCamera } from '../hooks/useCamera';
import CameraPermissionDialog from './CameraPermissionDialog';
import styles from './CameraPanel.module.scss';

export default function CameraPanel() {
  const [previewImage, setPreviewImage] = useState('');
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(true);
  const fileInputRef = useRef(null);

  const {
    videoRef,
    status: cameraStatus,
    capturePhoto,
    retryCamera,
    switchCamera,
  } = useCamera(!previewImage);

  const handleGalleryChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreviewImage(String(reader.result));
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleShutterClick = () => {
    if (previewImage) {
      setPreviewImage('');
      return;
    }

    const image = capturePhoto();
    if (image) setPreviewImage(image);
  };

  const showPermissionDialog =
    isPermissionDialogOpen &&
    ['denied', 'unsupported', 'error'].includes(cameraStatus);

  return (
    <>
      <section className={styles.cameraContent} role="tabpanel">
        <div className={styles.cameraPreview}>
          {previewImage ? (
            <img
              className={styles.cameraMedia}
              src={previewImage}
              alt="선택하거나 촬영한 식사"
            />
          ) : (
            <video
              ref={videoRef}
              className={styles.cameraMedia}
              autoPlay
              muted
              playsInline
            />
          )}

          {!previewImage && cameraStatus === 'requesting' && (
            <p className={styles.cameraMessage}>카메라를 준비하고 있어요.</p>
          )}

          <div className={styles.cameraGrid} aria-hidden="true" />
          <button
            type="button"
            className={styles.flashButton}
            aria-label="플래시 미지원"
            disabled
          >
            <MdFlashOff aria-hidden="true" />
          </button>
        </div>

        <div className={styles.cameraControls}>
          <button
            type="button"
            className={styles.controlButton}
            aria-label="사진 보관함 열기"
            onClick={() => fileInputRef.current?.click()}
          >
            <MdOutlinePhotoLibrary aria-hidden="true" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleGalleryChange}
          />

          <button
            type="button"
            className={styles.shutterButton}
            aria-label={previewImage ? '다시 촬영하기' : '사진 촬영하기'}
            onClick={handleShutterClick}
          />

          <button
            type="button"
            className={styles.controlButton}
            aria-label="카메라 방향 전환"
            disabled={cameraStatus !== 'ready' || Boolean(previewImage)}
            onClick={switchCamera}
          >
            <MdCameraswitch aria-hidden="true" />
          </button>
        </div>
      </section>

      {showPermissionDialog && (
        <CameraPermissionDialog
          onRetry={retryCamera}
          onCancel={() => setIsPermissionDialogOpen(false)}
        />
      )}
    </>
  );
}
