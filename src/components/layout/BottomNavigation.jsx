import styles from './BottomNavigation.module.scss';
import { RiHome6Fill } from 'react-icons/ri';
import { MdCameraAlt } from 'react-icons/md';
import { MdCalendarMonth } from 'react-icons/md';
import { BsPersonFill } from 'react-icons/bs';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/home', label: '홈', icon: <RiHome6Fill /> },
  { to: '/meals/new', label: '식사 기록', icon: <MdCameraAlt /> },
  { to: '/calendar', label: '캘린더', icon: <MdCalendarMonth /> },
  { to: '/mypage', label: '마이페이지', icon: <BsPersonFill /> },
];

export default function BottomNavigation() {
  return (
    <nav className={styles.container}>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.active : ''}`
          }
        >
          {item.icon}
        </NavLink>
      ))}
    </nav>
  );
}
