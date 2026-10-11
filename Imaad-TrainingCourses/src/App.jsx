import { useState } from 'react';
import TrainingCourses from './TrainingCourses';

export default function App() {
  const TEST_ROLES = {
    member: {
  id: '25e6a11f-2aa2-4c99-8966-8c7dcbb96b0c',
  isVerified: true,
  isMemberActive: true,
  role: 'member'
},
    admin: { isVerified: true, isMemberActive: true, role: 'admin' },
    guest: { isVerified: false, isMemberActive: false, role: 'member' }
  };

  const [currentRole, setCurrentRole] = useState('member');

  return (
    <div className="forge-app">
      <div className="role-bar" style={roleBarContainerStyle}>
        <span className="utility-brand" style={utilityBrandStyle}>
          FORGE FITNESS
        </span>

        <span className="utility-label" style={utilityLabelStyle}>
          TRAINING PORTAL
        </span>

        <button
          className="role-button"
          onClick={() => setCurrentRole('member')}
          style={getRoleButtonStyle(currentRole === 'member')}
        >
          Active Member
        </button>

        <button
          className="role-button"
          onClick={() => setCurrentRole('admin')}
          style={getRoleButtonStyle(currentRole === 'admin')}
        >
          Admin Panel
        </button>

        <button
          className="role-button"
          onClick={() => setCurrentRole('guest')}
          style={getRoleButtonStyle(currentRole === 'guest')}
        >
          Guest Access
        </button>
      </div>

      <TrainingCourses user={TEST_ROLES[currentRole]} />
    </div>
  );
}

const roleBarContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',

  background:
    'linear-gradient(90deg,#020817 0%,#071426 100%)',

  borderBottom: '1px solid rgba(0,200,255,0.15)',

  padding: '14px 28px',

  color: '#fff',

  position: 'sticky',
  top: 0,
  zIndex: 999,

  backdropFilter: 'blur(12px)'
};

const utilityBrandStyle = {
  marginRight: '12px',

  color: '#00c8ff',

  fontSize: '13px',

  fontWeight: 900,

  letterSpacing: '2px',

  textTransform: 'uppercase',

  textShadow: '0 0 12px rgba(0,200,255,0.5)'
};

const utilityLabelStyle = {
  color: '#94a3b8',

  fontSize: '11px',

  fontWeight: 700,

  letterSpacing: '1.5px',

  textTransform: 'uppercase'
};

const getRoleButtonStyle = (isActive) => ({
  background: isActive
    ? 'linear-gradient(90deg,#00c8ff,#009dff)'
    : 'rgba(255,255,255,0.04)',

  border: isActive
    ? '1px solid #00c8ff'
    : '1px solid rgba(0,200,255,0.12)',

  color: isActive ? '#02111d' : '#ffffff',

  borderRadius: '999px',

  padding: '10px 16px',

  cursor: 'pointer',

  fontWeight: 800,

  letterSpacing: '0.5px',

  fontSize: '12px',

  transition: 'all .2s ease',

  boxShadow: isActive
    ? '0 0 20px rgba(0,200,255,0.35)'
    : 'none'
});