const PENDING_INVITE_KEY = 'bodybuddy.pendingInvite';
const PENDING_INVITE_MAX_AGE_MS = 2 * 60 * 60 * 1000;

function createRequestKey() {
  return globalThis.crypto?.randomUUID?.() ??
    `invite-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getPendingInvite() {
  try {
    const pending = JSON.parse(
      sessionStorage.getItem(PENDING_INVITE_KEY) || 'null',
    );

    const capturedAt = Date.parse(pending?.capturedAt);
    const isExpired =
      !Number.isFinite(capturedAt) ||
      Date.now() - capturedAt > PENDING_INVITE_MAX_AGE_MS;

    if (!pending?.code || !pending?.requestKey || isExpired) {
      sessionStorage.removeItem(PENDING_INVITE_KEY);
      return null;
    }

    return pending;
  } catch {
    sessionStorage.removeItem(PENDING_INVITE_KEY);
    return null;
  }
}

export function savePendingInvite(code) {
  if (typeof code !== 'string' || !code.trim()) return null;

  const normalizedCode = code.trim();
  const current = getPendingInvite();

  if (current?.code === normalizedCode) return current;

  const pending = {
    code: normalizedCode,
    requestKey: createRequestKey(),
    capturedAt: new Date().toISOString(),
  };

  sessionStorage.setItem(PENDING_INVITE_KEY, JSON.stringify(pending));
  return pending;
}

export function markPendingInviteOnboardingStarted(code) {
  const pending = savePendingInvite(code);

  if (!pending) return null;

  const startedAt = new Date().toISOString();
  const nextPending = {
    ...pending,
    capturedAt: startedAt,
    onboardingStartedAt: startedAt,
  };

  sessionStorage.setItem(PENDING_INVITE_KEY, JSON.stringify(nextPending));
  return nextPending;
}

export function clearPendingInvite(code) {
  const current = getPendingInvite();

  if (!code || current?.code === code) {
    sessionStorage.removeItem(PENDING_INVITE_KEY);
  }
}
