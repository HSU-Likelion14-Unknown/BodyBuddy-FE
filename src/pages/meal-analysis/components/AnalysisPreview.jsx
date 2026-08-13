import styles from './AnalysisPreview.module.scss';

export default function AnalysisPreview({ image, description }) {
  return (
    <div className={styles.previewContent}>
      {image ? (
        <img src={image} alt="분석 중인 식사" />
      ) : (
        <div className={styles.descriptionPreview}>
          <strong>직접 입력한 식사</strong>
          <p>{description || '입력한 식사 정보를 분석하고 있어요.'}</p>
        </div>
      )}

      <span className={styles.scanLine} />
    </div>
  );
}
