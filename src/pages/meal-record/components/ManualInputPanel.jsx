import styles from './ManualInputPanel.module.scss';

export default function ManualInputPanel({ value, onChange, onAnalyze }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const description = value.trim();

    if (description) onAnalyze?.({ source: 'manual', description });
  };

  return (
    <form
      className={styles.manualContent}
      role="tabpanel"
      onSubmit={handleSubmit}
    >
      <div className={styles.manualField}>
        <label htmlFor="meal-description">
          “오늘 식사를 자유롭게 적어주세요.”
        </label>
        <textarea
          id="meal-description"
          value={value}
          maxLength={500}
          placeholder={
            '예: 점심에 비빔밥 한 그릇, 된장국, 깍두기 조금...\n먹은 양이나 조리법을 적어주시면 더 정확해요'
          }
          onChange={(event) => onChange(event.target.value)}
        />
      </div>

      <p className={styles.helperText}>
        브랜드 등 자세하게 적을 수록,
        <br />
        바디버디가 더 정확하게 영양소를 채워 줄 수 있어요.
      </p>

      <button
        type="submit"
        className={styles.recordButton}
        disabled={!value.trim()}
      >
        기록 시작하기
      </button>
    </form>
  );
}
