import { Navigate, Outlet } from 'react-router-dom';
import { getAccessKey } from '@/api/tokenStorage';
import { getOnboardingCompletedAt } from '@/api/userStorage';

export function ProtectedRoute() {
  if (!getAccessKey()) {
    return <Navigate to="/" replace />;
  }

  if (!getOnboardingCompletedAt()) {
    return <Navigate to="/onboarding/1" replace />;
  }

  return <Outlet />;
}

export function OnboardingRoute() {
  if (!getAccessKey()) {
    return <Navigate to="/" replace />;
  }

  if (getOnboardingCompletedAt()) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
