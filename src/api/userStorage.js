const ONBOARDING_COMPLETED_KEY = 'bodybuddy.onboardingCompletedAt';

export function getOnboardingCompletedAt() {
  return localStorage.getItem(ONBOARDING_COMPLETED_KEY);
}

export function setOnboardingCompletedAt(value) {
  localStorage.setItem(ONBOARDING_COMPLETED_KEY, value);
}

export function clearOnboardingCompletedAt() {
  localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
}
