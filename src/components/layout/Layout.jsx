import { Outlet, useLocation } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';

export const Layout = () => {
  const { pathname } = useLocation();

  const isBottomNavigationHidden =
    pathname === '/' ||
    pathname === '/onboarding' ||
    pathname.startsWith('/onboarding/') ||
    pathname.startsWith('/share-room/invite/') ||
    pathname === '/error/network';

  return (
    <div
      style={{
        // 작은 폰(360px)에서는 꽉 차고, 큰 폰에서는 430px에서 멈춤
        width: '100%',
        maxWidth: '430px',
        minHeight: '100dvh',
        margin: '0 auto',
        position: 'relative',
        backgroundColor: '#fefefe',
      }}
    >
      <Outlet />
      {!isBottomNavigationHidden && <BottomNavigation />}
    </div>
  );
};
