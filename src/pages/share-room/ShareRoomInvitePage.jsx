import { useCallback, useEffect, useRef, useState } from 'react';
import { MdErrorOutline, MdGroupAdd } from 'react-icons/md';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { postAnonymous } from '@/api/auth';
import { getApiErrorMessage } from '@/api/error';
import { joinRoom } from '@/api/rooms';
import { getAccessKey, setAccessKey } from '@/api/tokenStorage';
import {
  clearOnboardingCompletedAt,
  getOnboardingCompletedAt,
  setOnboardingCompletedAt,
} from '@/api/userStorage';
import {
  clearPendingInvite,
  markPendingInviteOnboardingStarted,
  savePendingInvite,
} from '@/utils/pendingInvite';
import styles from './ShareRoomInvitePage.module.scss';

async function prepareInviteSession() {
  let onboardingCompletedAt = getOnboardingCompletedAt();

  if (!getAccessKey()) {
    const session = await postAnonymous();
    setAccessKey(session.accessKey);
    onboardingCompletedAt = session.onboardingCompletedAt ?? null;

    if (session.onboardingCompletedAt) {
      setOnboardingCompletedAt(session.onboardingCompletedAt);
    } else {
      clearOnboardingCompletedAt();
    }
  }

  return { needsOnboarding: !onboardingCompletedAt };
}

export default function ShareRoomInvitePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { code } = useParams();
  const [status, setStatus] = useState(code ? 'preparing' : 'error');
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [errorSource, setErrorSource] = useState('prepare');
  const [preparedCode, setPreparedCode] = useState('');
  const [prepareAttempt, setPrepareAttempt] = useState(0);
  const prepareRequestRef = useRef(null);
  const joinRequestRef = useRef(null);
  const mountedRef = useRef(false);
  const activeCodeRef = useRef(code);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    activeCodeRef.current = code;

    return () => {
      activeCodeRef.current = null;
    };
  }, [code]);

  useEffect(() => {
    if (!code) return undefined;

    savePendingInvite(code);

    const requestId = `${code}:${prepareAttempt}`;
    if (prepareRequestRef.current?.requestId !== requestId) {
      prepareRequestRef.current = {
        requestId,
        promise: prepareInviteSession(),
      };
    }

    let active = true;
    prepareRequestRef.current.promise
      .then((result) => {
        if (!active) return;
        setNeedsOnboarding(result.needsOnboarding);
        setPreparedCode(code);
        setStatus('ready');
      })
      .catch((error) => {
        if (!active) return;
        setErrorCode(code);
        setErrorSource('prepare');
        setStatus('error');
        setErrorMessage(
          getApiErrorMessage(error, '초대 정보를 준비하지 못했어요.'),
        );
      });

    return () => {
      active = false;
    };
  }, [code, prepareAttempt]);

  const joinInvite = useCallback(() => {
    if (!code) return;

    const pending = savePendingInvite(code);
    if (!pending) return;

    setStatus('joining');
    setErrorMessage('');

    if (joinRequestRef.current?.code !== code) {
      joinRequestRef.current = {
        code,
        promise: joinRoom(code, { requestKey: pending.requestKey }),
      };
    }

    joinRequestRef.current.promise
      .then((room) => {
        if (activeCodeRef.current !== code) return;

        clearPendingInvite(code);
        if (!mountedRef.current) return;

        navigate(`/share-room/${room.roomId}`, {
          replace: true,
          state: { roomName: room.roomName },
        });
      })
      .catch((error) => {
        if (activeCodeRef.current !== code) return;

        joinRequestRef.current = null;
        if (!mountedRef.current) return;

        if (error?.code === 'ONBOARDING_REQUIRED') {
          setNeedsOnboarding(true);
          setPreparedCode(code);
          setStatus('ready');
          return;
        }

        setErrorCode(code);
        setErrorSource('join');
        setStatus('error');
        setErrorMessage(
          getApiErrorMessage(error, '공유방에 참여하지 못했어요.'),
        );
      });
  }, [code, navigate]);

  useEffect(() => {
    if (
      status === 'ready' &&
      preparedCode === code &&
      !needsOnboarding &&
      location.state?.joinAfterOnboarding === code
    ) {
      const timerId = window.setTimeout(joinInvite, 0);
      return () => window.clearTimeout(timerId);
    }

    return undefined;
  }, [code, joinInvite, location.state, needsOnboarding, preparedCode, status]);

  const continueInvite = () => {
    if (needsOnboarding) {
      markPendingInviteOnboardingStarted(code);
      navigate('/onboarding/1', { replace: true });
      return;
    }

    joinInvite();
  };

  const retry = () => {
    joinRequestRef.current = null;

    if (errorSource === 'join' && preparedCode === code) {
      joinInvite();
      return;
    }

    setStatus('preparing');
    setErrorMessage('');
    setPrepareAttempt((attempt) => attempt + 1);
  };

  const leaveInvite = () => {
    clearPendingInvite(code);

    if (preparedCode !== code) {
      navigate('/', { replace: true });
      return;
    }

    navigate(needsOnboarding ? '/onboarding/1' : '/home', { replace: true });
  };

  const failureMessage = code ? errorMessage : '초대 코드가 없어요.';
  const isCurrentError = !code || (status === 'error' && errorCode === code);
  const isCurrentReady = status === 'ready' && preparedCode === code;

  if (isCurrentError) {
    return (
      <main className={styles.container}>
        <div className={`${styles.iconContent} ${styles.errorIcon}`}>
          <MdErrorOutline />
        </div>
        <h1>공유방에 참여할 수 없어요.</h1>
        <p>{failureMessage}</p>
        <div className={styles.actionContent}>
          {code && (
            <button type="button" className={styles.primaryButton} onClick={retry}>
              다시 시도하기
            </button>
          )}
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={leaveInvite}
          >
            처음 화면으로
          </button>
        </div>
      </main>
    );
  }

  if (isCurrentReady) {
    return (
      <main className={styles.container}>
        <div className={styles.iconContent}>
          <MdGroupAdd />
        </div>
        <h1>친구의 공유방에 초대받았어요.</h1>
        <p>
          {needsOnboarding
            ? '바디버디를 시작하고 친구와 식사 기록을 공유해 보세요.'
            : '참여하면 친구와 식사 기록을 함께 볼 수 있어요.'}
        </p>
        <div className={styles.actionContent}>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={continueInvite}
          >
            {needsOnboarding ? '시작하고 참여하기' : '공유방 참여하기'}
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={leaveInvite}
          >
            {needsOnboarding ? '초대 없이 시작하기' : '나중에 할게요'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <div className={styles.iconContent}>
        <MdGroupAdd />
      </div>
      <h1>
        {status === 'joining'
          ? '친구의 공유방에 참여하는 중이에요.'
          : '초대 정보를 확인하고 있어요.'}
      </h1>
      <p>잠시만 기다려 주세요.</p>
      <div className={styles.loadingDots}>
        <span />
        <span />
        <span />
      </div>
    </main>
  );
}
