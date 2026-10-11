import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from './lib/supabaseClient';

// Self-contained generated movement-guide videos. These do not depend on YouTube or an external host.
const LOCAL_HIIT_CONDITIONING_VIDEO = 'https://videos.pexels.com/video-files/4943927/4943927-uhd_2160_4096_24fps.mp4';

const createWorkoutArt = (title, muscleGroup) => {
  const safeTitle = String(title || 'Forge Workout').replace(/&/g, '&amp;');
  const safeMuscleGroup = String(muscleGroup || 'Performance Training').replace(/&/g, '&amp;');
  const workoutName = `${title} ${muscleGroup}`.toLowerCase();
  const isPress = /bench|press|chest|push/.test(workoutName);
  const isSquat = /squat|mobility|hip|glute|leg/.test(workoutName);
  const isDeadlift = /deadlift|posterior|back|hinge/.test(workoutName);
  const figureStroke = '#20252b';
  const highlight = '#00c8ff';
  const line = (x1, y1, x2, y2, width = 7) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${figureStroke}" stroke-width="${width}" stroke-linecap="round"/>`;
  const joint = (cx, cy, r = 9) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${figureStroke}" stroke-width="5"/>`;
  const head = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="19" fill="#fff" stroke="${figureStroke}" stroke-width="5"/>`;
  const pressPanel = (offset, second = false) => `
    ${head(offset + 118, 112)}
    <path d="M${offset + 104} 137 Q${offset + 155} ${second ? 155 : 135} ${offset + 180} 188 L${offset + 144} 240 L${offset + 91} 220 Z" fill="${second ? highlight : '#f6f7f5'}" stroke="${figureStroke}" stroke-width="5"/>
    ${line(offset + 133, 180, offset + (second ? 193 : 174), second ? 126 : 112)}
    ${line(offset + 193, second ? 126 : 112, offset + 236, second ? 126 : 112, 5)}
    ${line(offset + 118, 225, offset + 83, 292)}${line(offset + 83, 292, offset + 48, 292)}
    ${line(offset + 139, 230, offset + 181, 292)}${line(offset + 181, 292, offset + 220, 292)}
    ${joint(offset + 133, 180)}${joint(offset + 118, 225)}
    <path d="M${offset + 225} 102 q28 12 0 26" fill="none" stroke="${highlight}" stroke-width="8" stroke-linecap="round"/>
  `;
  const squatPanel = (offset, second = false) => `
    ${head(offset + 126, 105)}
    <path d="M${offset + 111} 129 Q${offset + 155} 139 ${offset + 170} ${second ? 198 : 177} L${offset + 140} 221 L${offset + 90} 192 Z" fill="${second ? highlight : '#f6f7f5'}" stroke="${figureStroke}" stroke-width="5"/>
    ${line(offset + 135, 175, offset + (second ? 190 : 154), second ? 219 : 265)}
    ${line(offset + 154, 265, offset + 205, 265)}${line(offset + 190, 219, offset + 247, second ? 231 : 184)}
    ${line(offset + 247, second ? 231 : 184, offset + 280, second ? 262 : 145)}
    ${joint(offset + 135, 175)}${joint(offset + 154, 265)}
    <path d="M${offset + 72} 106 q-25 24 0 46" fill="none" stroke="${highlight}" stroke-width="8" stroke-linecap="round"/>
  `;
  const hingePanel = (offset, second = false) => `
    ${head(offset + 145, 111)}
    <path d="M${offset + 127} 136 L${offset + (second ? 176 : 195)} 183 L${offset + 157} 221 L${offset + 94} 188 Z" fill="${second ? highlight : '#f6f7f5'}" stroke="${figureStroke}" stroke-width="5"/>
    ${line(offset + 151, 183, offset + 111, 246)}${line(offset + 111, 246, offset + 72, 286)}
    ${line(offset + 157, 220, offset + 208, 276)}${line(offset + 208, 276, offset + 248, 276)}
    ${joint(offset + 151, 183)}${joint(offset + 157, 220)}
    <rect x="${offset + 55}" y="${second ? 274 : 294}" width="190" height="7" rx="3" fill="${figureStroke}"/>
    <path d="M${offset + 203} 94 q28 18 0 38" fill="none" stroke="${highlight}" stroke-width="8" stroke-linecap="round"/>
  `;
  const circuitPanel = (offset, second = false) => `
    ${head(offset + 120, 106)}
    <path d="M${offset + 103} 130 Q${offset + 150} 136 ${offset + 161} 183 L${offset + 130} 223 L${offset + 83} 192 Z" fill="${second ? highlight : '#f6f7f5'}" stroke="${figureStroke}" stroke-width="5"/>
    ${line(offset + 130, 180, offset + (second ? 188 : 170), second ? 231 : 274)}${line(offset + 170, 274, offset + 213, 274)}
    ${line(offset + 151, 185, offset + 91, 235)}${line(offset + 91, 235, offset + 45, 235)}
    ${joint(offset + 130, 180)}${joint(offset + 151, 185)}
    <path d="M${offset + 80} 100 q-24 25 0 48 M${offset + 208} 132 q25 20 0 42" fill="none" stroke="${highlight}" stroke-width="8" stroke-linecap="round"/>
  `;
  let illustration = isPress
    ? `${pressPanel(55)}${pressPanel(335, true)}${pressPanel(615)}`
    : isSquat
      ? `${squatPanel(55)}${squatPanel(335, true)}${squatPanel(615)}`
      : isDeadlift
        ? `${hingePanel(55)}${hingePanel(335, true)}${hingePanel(615)}`
        : `${circuitPanel(55)}${circuitPanel(335, true)}${circuitPanel(615)}`;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <rect width="1200" height="800" fill="#081528"/>
      <path d="M0 400 H1200 M400 0 V800 M800 0 V800" stroke="#eef1ed" stroke-width="3"/>
      <g>${illustration}</g>
      <g transform="translate(0 318) scale(0.82)">${illustration}</g>
      <rect x="38" y="696" width="1124" height="70" rx="12" fill="#f5f7f3"/>
      <rect x="58" y="717" width="26" height="26" rx="7" fill="${highlight}"/>
      <text x="100" y="738" font-family="Segoe UI, Arial" font-size="25" font-weight="800" fill="#20252b">${safeTitle}</text>
      <text x="1150" y="738" text-anchor="end" font-family="Segoe UI, Arial" font-size="20" font-weight="600" fill="#68736b">${safeMuscleGroup}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const getWorkoutPhoto = (title = '', muscleGroup = '') => createWorkoutArt(title, muscleGroup);

// Seeded course videos use real-human Pexels footage in a multi-clip playlist.
// The player sequences clips to the exact duration shown on each card.


const LEVEL_ORDER = { Beginner: 0, Intermediate: 1, Advanced: 2 };

const pluralise = (count, singular, plural = `${singular}s`) => (count === 1 ? singular : plural);






// Fallback for Admin-published workouts that don't supply a video URL.
const DEFAULT_VIDEO_URL = LOCAL_HIIT_CONDITIONING_VIDEO;

const pageShellStyle = {
  position: 'relative',
  isolation: 'isolate',
  maxWidth: '1520px',
  margin: '0 auto',
  padding: '32px 40px 56px',
  fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
  color: '#ffffff',
  background: 'transparent'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  background: 'linear-gradient(120deg, #0b1930 0%, #102f59 62%, #135bc3 100%)',
  border: '1px solid #193e73',
  borderRadius: '18px 18px 0 0',
  color: '#fff',
  padding: '22px 26px',
  boxShadow: '0 20px 38px rgba(13, 56, 128, 0.16)'
};

const brandStyle = {
  fontSize: '23px',
  fontWeight: 900,
  letterSpacing: '1.8px',
  textTransform: 'uppercase',
  color: '#fff'
};

const headerActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap'
};

const statPillStyle = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.22)',
  color: '#dcecff',
  borderRadius: '999px',
  padding: '7px 12px',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '1px',
  textTransform: 'uppercase'
};

const heroStyle = {
  position: 'relative',
  overflow: 'hidden',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.35fr) minmax(260px, 0.65fr)',
  gap: '28px',
  alignItems: 'end',
  minHeight: '290px',
  padding: '42px 40px 36px',
  background: 'linear-gradient(120deg, #0b1930 0%, #123765 62%, #1768d7 100%)',
  border: '1px solid #193e73',
  borderTop: 'none',
  borderRadius: '0 0 22px 22px',
  color: '#fff'
};

const heroGlowStyle = {
  position: 'absolute',
  width: '260px',
  height: '260px',
  right: '10%',
  top: '-120px',
  borderRadius: '50%',
  background: 'rgba(185, 229, 143, 0.16)',
  filter: 'blur(2px)'
};

const heroLinesStyle = {
  position: 'absolute',
  inset: 0,
  opacity: 0.16,
  backgroundImage: 'linear-gradient(110deg, transparent 0 42%, rgba(185,229,143,0.8) 42.1%, transparent 42.4%), linear-gradient(110deg, transparent 0 62%, rgba(255,255,255,0.55) 62.1%, transparent 62.3%)',
  backgroundSize: '100% 100%',
  pointerEvents: 'none'
};

const heroCopyStyle = { position: 'relative', zIndex: 1 };

const heroEyebrowStyle = {
  margin: '0 0 12px',
  color: '#00c8ff',
  fontSize: '12px',
  fontWeight: 900,
  letterSpacing: '2px',
  textTransform: 'uppercase'
};

const heroTitleStyle = {
  maxWidth: '680px',
  margin: 0,
  color: '#fff',
  fontSize: 'clamp(2.4rem, 4.8vw, 5rem)',
  lineHeight: 0.98,
  fontWeight: 900,
  letterSpacing: '-2.5px'
};

const heroTextStyle = {
  maxWidth: '590px',
  margin: '17px 0 0',
  color: '#c6d9f2',
  fontSize: '16px',
  lineHeight: 1.6
};

const heroAsideStyle = {
  position: 'relative',
  zIndex: 1,
  padding: '18px',
  background: 'linear-gradient(145deg, rgba(255,255,255,0.12), rgba(4, 16, 35, 0.42))',
  border: '1px solid rgba(185,229,143,0.32)',
  borderRadius: '16px',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 14px 30px rgba(2, 16, 40, 0.16)'
};

const heroAsideLabelStyle = {
  display: 'block',
  color: '#a9c5e8',
  fontSize: '11px',
  fontWeight: 900,
  letterSpacing: '1.4px',
  textTransform: 'uppercase',
  fontFamily: 'Space Grotesk, DM Sans, sans-serif'
};

const heroAsideTextStyle = {
  margin: '9px 0 0',
  color: '#fff',
  fontSize: '18px',
  lineHeight: 1.35,
  fontWeight: 800
};

const heroActionStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '18px',
  border: 'none',
  borderRadius: '10px',
  background: '#00c8ff',
  color: '#17212b',
  padding: '11px 15px',
  fontSize: '13px',
  fontWeight: 900,
  cursor: 'pointer'
};

const heroSecondaryActionStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  marginTop: '18px',
  marginLeft: '8px',
  border: '1px solid rgba(255,255,255,0.28)',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  padding: '10px 14px',
  fontSize: '13px',
  fontWeight: 900,
  cursor: 'pointer'
};

const toolbarStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(220px, 1.7fr) repeat(2, minmax(150px, 1fr))',
  gap: '12px',
  background: 'rgba(247, 251, 255, 0.86)',
  backdropFilter: 'blur(14px)',
  borderLeft: '1px solid rgba(0,200,255,0.15)',
  borderRight: '1px solid rgba(0,200,255,0.15)',
  padding: '18px 22px'
};

const fieldStyle = {
  border: '1px solid rgba(0,200,255,0.12)',
  borderRadius: '12px',
  padding: '12px 14px',
  fontSize: '14px',
  background: '#081528',
  color: '#ffffff',
  width: '100%',
  boxSizing: 'border-box',
  outline: 'none'
};

const catalogStyle = {
  display: 'block',
  background: 'rgba(220, 234, 255, 0.2)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(0,200,255,0.15)',
  borderRadius: '0 0 18px 18px',
  padding: '16px 0 20px',
  boxShadow: '0 20px 36px rgba(15, 23, 42, 0.05)'
};

const accessGateStyle = {
  maxWidth: '620px',
  margin: '58px auto',
  padding: '50px 42px',
  textAlign: 'center',
  background: '#081528',
  border: '1px solid rgba(0,200,255,0.15)',
  borderRadius: '24px',
  boxShadow: '0 20px 44px rgba(31, 86, 164, 0.1)'
};

const accessGateTitleStyle = {
  margin: '0 0 12px',
  color: '#ffffff',
  fontSize: '30px',
  fontWeight: 900
};

const accessGateTextStyle = {
  margin: 0,
  color: '#cbd5e1',
  fontSize: '16px',
  lineHeight: 1.6
};









const adminPanelStyle = {
  margin: '0 0 18px',
  padding: '22px 24px',
  background: '#081528',
  border: '1px solid rgba(0,200,255,0.15)',
  borderRadius: '18px',
  boxShadow: '0 12px 26px rgba(31, 86, 164, 0.06)'
};

const adminTitleStyle = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 900,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  marginBottom: '5px'
};

const adminSubtitleStyle = {
  margin: '0 0 16px',
  color: '#94a3b8',
  fontSize: '13px'
};

const adminFormStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: '10px'
};

const adminFullWidthStyle = { gridColumn: '1 / -1' };

const adminListStyle = {
  display: 'grid',
  gap: '8px',
  marginTop: '16px'
};

const adminRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '10px 12px',
  background: '#081528',
  border: '1px solid #e1edfb',
  borderRadius: '10px'
};

const removeButtonStyle = {
  border: '1px solid #fecaca',
  borderRadius: '8px',
  background: '#fff1f2',
  color: '#be123c',
  fontWeight: 800,
  padding: '7px 10px',
  cursor: 'pointer'
};

const adminInputStyle = {
  ...fieldStyle,
  fontSize: '13px',
  padding: '10px 12px'
};

const primaryButtonStyle = {
  border: 'none',
  borderRadius: '10px',
  background: 'linear-gradient(135deg, #00c8ff, #0a3d92)',
  color: '#fff',
  fontWeight: 800,
  padding: '11px 14px',
  cursor: 'pointer'
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: '#e2edf9',
  color: '#00c8ff'
};

const mainStyle = {
  display: 'grid',
  gap: '18px'
};

const resultsHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  background: '#081528',
  border: '1px solid rgba(0,200,255,0.12)',
  borderRadius: '14px',
  padding: '16px 18px',
  boxShadow: '0 8px 18px rgba(31, 86, 164, 0.04)'
};

const resultsTitleStyle = {
  fontSize: '14px',
  fontWeight: 900,
  color: '#ffffff',
  letterSpacing: '1px',
  textTransform: 'uppercase'
};

const resultsCountStyle = {
  color: '#475569',
  fontSize: '13px',
  fontWeight: 700
};

const metricsBarStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
  marginBottom: '18px'
};

const metricStyle = {
  position: 'relative',
  overflow: 'hidden',
  padding: '17px 18px',
  background: 'linear-gradient(145deg, rgba(13, 47, 91, 0.95), rgba(19, 91, 195, 0.84))',
  border: '1px solid rgba(145, 190, 255, 0.25)',
  borderRadius: '17px',
  color: '#fff',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.13), 0 10px 22px rgba(16, 61, 122, 0.12)'
};

const metricLabelStyle = {
  display: 'block',
  color: '#a9c5e8',
  fontSize: '11px',
  fontWeight: 900,
  letterSpacing: '1px',
  textTransform: 'uppercase'
};

const metricValueStyle = {
  display: 'block',
  marginTop: '6px',
  color: '#00c8ff',
  fontSize: '29px',
  fontWeight: 900
};

const libraryControlsStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap'
};

const focusBarStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexWrap: 'wrap',
  marginTop: '14px'
};

const focusChipStyle = (active) => ({
  border: `1px solid ${active ? '#00c8ff' : '#dbe8f6'}`,
  borderRadius: '999px',
  background: active ? '#081528' : '#081528',
  color: active ? '#00c8ff' : '#94a3b8',
  padding: '8px 13px',
  fontSize: '12px',
  fontWeight: 900,
  cursor: 'pointer',
  boxShadow: active ? '0 5px 14px rgba(37, 99, 235, 0.14)' : 'none'
});

const clearFiltersStyle = {
  marginLeft: 'auto',
  border: 'none',
  background: 'transparent',
  color: '#00c8ff',
  fontSize: '12px',
  fontWeight: 900,
  cursor: 'pointer'
};

const emptyStateStyle = {
  gridColumn: '1 / -1',
  display: 'grid',
  justifyItems: 'center',
  gap: '10px',
  padding: '48px 24px',
  border: '1px solid #203047',
  borderRadius: '18px',
  background: '#081528',
  color: '#cbd5e1',
  textAlign: 'center'
};

const courseGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '28px'
};

const courseCardStyle = {
  background: '#081528',
  border: '1px solid rgba(0,200,255,0.18)',
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: '0 18px 40px rgba(31, 86, 164, 0.16)',
  display: 'flex',
  flexDirection: 'column'
};

const courseImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  objectPosition: 'center center',
  display: 'block',
  background: '#071426'
};

const courseBodyStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '19px 21px 18px',
  background: '#081528'
};

const courseMetaStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px',
  color: '#00c8ff',
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '0.8px',
  textTransform: 'uppercase'
};

const courseTitleStyle = {
  margin: 0,
  fontSize: '22px',
  fontWeight: 900,
  lineHeight: '1.2',
  color: '#ffffff'
};

const courseOverviewStyle = {
  margin: 0,
  color: '#cbd5e1',
  fontSize: '14px',
  lineHeight: '1.6'
};

const courseStatsStyle = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap'
};

const statChipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#edf4ff',
  color: '#00c8ff',
  borderRadius: '999px',
  padding: '6px 10px',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '0.5px'
};

const courseActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: 'auto',
  paddingTop: '13px',
  borderTop: '1px solid #e2e8f0'
};

const sessionIndexStyle = {
  position: 'absolute',
  top: '14px',
  right: '14px',
  zIndex: 1,
  padding: '6px 9px',
  border: '1px solid rgba(255,255,255,0.4)',
  borderRadius: '999px',
  background: 'rgba(15, 23, 42, 0.68)',
  color: '#fff',
  fontSize: '11px',
  fontWeight: 900,
  letterSpacing: '1px',
  fontFamily: 'Space Grotesk, DM Sans, sans-serif'
};

const guideButtonStyle = {
  position: 'absolute',
  left: '18px',
  bottom: '16px',
  border: '1px solid rgba(255,255,255,0.24)',
  borderRadius: '12px',
  background: 'rgba(8, 21, 40, 0.88)',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 900,
  padding: '11px 14px',
  cursor: 'pointer',
  zIndex: 1,
  backdropFilter: 'blur(8px)'
};

const imageWrapStyle = {
  aspectRatio: '3 / 2',
  minHeight: 0,
  position: 'relative',
  background: '#071426',
  overflow: 'hidden'
};

const categoryPillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  background: '#dceaff',
  color: '#2457d6',
  borderRadius: '999px',
  padding: '7px 12px',
  fontSize: '12px',
  fontWeight: 900,
  letterSpacing: '0.8px',
  textTransform: 'uppercase'
};

const muscleGroupStyle = {
  color: '#00c8ff',
  fontSize: '13px',
  fontWeight: 900,
  letterSpacing: '1px',
  textTransform: 'uppercase'
};

const completeButtonStyle = (completed) => ({
  border: `1px solid ${completed ? '#00c8ff' : 'rgba(0,200,255,0.15)'}`,
  borderRadius: '12px',
  background: completed ? '#dbeafe' : '#f5f9ff',
  color: '#00c8ff',
  fontWeight: 900,
  padding: '12px 16px',
  cursor: 'pointer'
});

const videoButtonStyle = {
  ...primaryButtonStyle,
  borderRadius: '12px',
  padding: '12px 18px'
};

const saveButtonStyle = (saved) => ({
  border: `1px solid ${saved ? '#00c8ff' : 'rgba(0,200,255,0.15)'}`,
  borderRadius: '12px',
  background: saved ? '#effbdd' : '#f5f9ff',
  color: saved ? '#355b22' : '#00c8ff',
  fontWeight: 900,
  padding: '12px 14px',
  cursor: 'pointer'
});

const modalBackdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.62)',
  display: 'grid',
  placeItems: 'center',
  padding: '22px',
  zIndex: 50
};

const modalCardStyle = {
  width: 'min(920px, 100%)',
  maxHeight: '86vh',
  overflow: 'auto',
  background: '#fff',
  borderRadius: '18px',
  border: '1px solid rgba(0,200,255,0.18)',
  boxShadow: '0 26px 66px rgba(15, 23, 42, 0.35)'
};

const modalHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '14px',
  padding: '18px 20px',
  background: '#081528',
  borderBottom: '1px solid rgba(0,200,255,0.18)'
};

const modalTitleStyle = {
  margin: 0,
  fontSize: '24px',
  fontWeight: 900,
  color: '#ffffff'
};

const modalBodyStyle = {
  display: 'grid',
  gridTemplateColumns: '1.1fr 0.9fr',
  gap: '20px',
  padding: '20px'
};

const modalImageStyle = {
  width: '100%',
  aspectRatio: '3 / 2',
  objectFit: 'contain',
  objectPosition: 'center center',
  borderRadius: '14px',
  display: 'block',
  background: '#071426'
};

const detailListStyle = {
  display: 'grid',
  gap: '12px',
  margin: '16px 0 0',
  paddingLeft: '18px',
  color: '#1e293b',
  lineHeight: '1.55',
  fontWeight: 600
};

const videoModalStyle = {
  ...modalBackdropStyle,
  background: 'rgba(2, 6, 23, 0.7)'
};

const videoCardStyle = {
  position: 'relative',
  width: 'min(1000px, 94vw)',
  background: '#020817',
  borderRadius: '16px',
  overflow: 'hidden',
  border: '1px solid rgba(148,163,184,0.3)'
};

// Responsive 16:9 aspect-ratio box for the YouTube iframe (padding-top trick,
// since the iframe itself can't be told to "keep its own aspect ratio" via a
// plain inline style the way an <img> or <video> can).




// A dedicated "✕" close button pinned to the corner of the video modal, on top
// of the video itself, per the requested design (separate from the header's
// text-label buttons used by the other modals).
const videoCloseButtonStyle = {
  position: 'absolute',
  top: '14px',
  right: '14px',
  zIndex: 2,
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  border: '1px solid rgba(0,200,255,0.45)',
  background: 'rgba(8,21,40,0.88)',
  color: '#00c8ff',
  fontSize: '17px',
  fontWeight: 900,
  lineHeight: 1,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const composerCardStyle = {
  width: 'min(760px, 100%)',
  maxHeight: '86vh',
  overflow: 'auto',
  background: '#081528',
  border: '1px solid rgba(0,200,255,0.15)',
  borderRadius: '22px',
  boxShadow: '0 30px 80px rgba(5, 30, 75, 0.28)'
};

const composerBodyStyle = {
  display: 'grid',
  gap: '18px',
  padding: '24px'
};

const composerChoiceRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '10px'
};

const composerChoiceStyle = (active) => ({
  border: `1px solid ${active ? '#00c8ff' : 'rgba(0,200,255,0.12)'}`,
  borderRadius: '14px',
  background: active ? '#081528' : '#fff',
  color: active ? '#00c8ff' : '#475569',
  padding: '14px 12px',
  textAlign: 'left',
  fontWeight: 900,
  cursor: 'pointer'
});

const planItemStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '14px',
  padding: '14px 16px',
  background: '#fff',
  border: '1px solid rgba(0,200,255,0.12)',
  borderRadius: '14px'
};


const SessionVideoPlayer = ({ sources = [], targetSeconds = 0, title }) => {
  const videoRef = useRef(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [baseElapsed, setBaseElapsed] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [clipDuration, setClipDuration] = useState(0);
  const [error, setError] = useState(false);
  const safeSources = sources.filter(Boolean);
  const target = Math.max(1, Number(targetSeconds) || 1);
  const formatTime = (seconds) => { const total = Math.max(0, Math.floor(seconds)); const minutes = Math.floor(total / 60); const secs = String(total % 60).padStart(2, '0'); return `${minutes}:${secs}`; };
   
  const handleLoadedMetadata = (event) => { setClipDuration(Number(event.currentTarget.duration) || 0); setError(false); };
  const handleTimeUpdate = (event) => { const local = Number(event.currentTarget.currentTime) || 0; const total = Math.min(target, baseElapsed + local); setElapsed(total); if (total >= target - 0.15) { event.currentTarget.pause(); setElapsed(target); } };
  const handleEnded = () => { const current = Number(videoRef.current?.duration) || clipDuration || 0; const nextBase = baseElapsed + current; if (nextBase >= target || safeSources.length === 0) { setElapsed(target); return; } setBaseElapsed(nextBase); setSourceIndex((index) => (index + 1) % safeSources.length); };
  const currentSrc = safeSources[sourceIndex] || safeSources[0];
  const progress = Math.min(100, (elapsed / target) * 100);
  if (!currentSrc) return <div style={{ padding: '40px', color: '#fff', background: '#020812' }}>No training video is configured for this workout.</div>;
  return (
    <div style={{ background: '#020812' }}>
      {error ? (
        <div style={{ padding: '48px 24px', color: '#fff', textAlign: 'center' }}><strong>Video could not be loaded.</strong><p style={{ color: '#a8b6c8', margin: '8px 0 0' }}>Check your network connection and try again.</p></div>
      ) : (
        <video ref={videoRef} key={`${title}-${sourceIndex}-${currentSrc}`} src={currentSrc} title={title} style={{ width: '100%', aspectRatio: '16 / 9', maxHeight: '70vh', objectFit: 'contain', display: 'block', background: '#000' }} controls playsInline preload="metadata" onLoadedMetadata={handleLoadedMetadata} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} onError={() => setError(true)} />
      )}
      <div style={{ padding: '14px 16px 16px', background: '#081528', color: '#cbd5e1' }}>
        <div style={{ height: '6px', borderRadius: '999px', background: '#203047', overflow: 'hidden', marginBottom: '10px' }}><div style={{ width: `${progress}%`, height: '100%', background: '#00c8ff', transition: 'width 120ms linear' }} /></div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '12px' }}><span>Real-human training footage · 4K/HD source</span><strong style={{ color: '#00c8ff' }}>{formatTime(elapsed)} / {formatTime(target)}</strong></div>
        <div style={{ marginTop: '7px', fontSize: '11px', color: '#8191a6' }}>Clips are sequenced automatically until the exact session length shown on the course card is reached.</div>
      </div>
    </div>
  );
};

export default function TrainingCourses({ user = { role: 'member' } }) {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const videoHistoryPushedRef = useRef(false);
  const [completedCourses, setCompletedCourses] = useState(() => new Set(JSON.parse(localStorage.getItem('forge-completed') || '[]')));
  const [savedCourses, setSavedCourses] = useState(() => new Set(JSON.parse(localStorage.getItem('forge-saved') || '[]')));
  const [enrolledCourses, setEnrolledCourses] = useState(() => new Set());
  const [focusMode, setFocusMode] = useState('all');
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerGoal, setComposerGoal] = useState('strength');
  const [composerMinutes, setComposerMinutes] = useState('30');

useEffect(() => {
  const loadCoursesFromSupabase = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('id, trainer_id, title, description, difficulty')
      .order('title', { ascending: true });

    if (error) {
      console.error('SUPABASE COURSE LOAD ERROR:', error);
      return;
    }

    const mappedCourses = (data || []).map((course) => ({
      id: course.id,
      trainerId: course.trainer_id,
      title: course.title,
      description:
        course.description ||
        'Training course available in the Forge Fitness library.',
      level: course.difficulty || 'Intermediate',
      category: 'Strength & Hypertrophy',
      duration: '12 mins',
      muscleGroup: 'General',
      overview:
        course.description ||
        'Training course available in the Forge Fitness library.',
      steps: [
        'Warm up intentionally.',
        'Move with control.',
        'Finish strong.'
      ],
      videoUrl: DEFAULT_VIDEO_URL,
      imageUrl: getWorkoutPhoto(course.title, 'General')
    }));

    setCourses(mappedCourses);
  };

  loadCoursesFromSupabase();
},   []);
useEffect(() => {
  const loadEnrollments = async () => {
    if (!user?.id) {
      setEnrolledCourses(new Set());
      return;
    }

    const { data, error } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', user.id);

    if (error) {
      console.error('SUPABASE ENROLLMENT LOAD ERROR:', error);
      return;
    }

    setEnrolledCourses(
      new Set((data || []).map((enrollment) => enrollment.course_id))
    );
  };

  loadEnrollments();
}, [user?.id]);


  const categories = useMemo(() => ['All', ...new Set(courses.map((course) => course.category))], [courses]);
  const levels = useMemo(() => ['All', ...new Set(courses.map((course) => course.level))], [courses]);

  const filteredCourses = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const forDisplay = courses.filter((course) => {
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel;
      const haystack = `${course.title} ${course.category} ${course.muscleGroup} ${course.description}`.toLowerCase();
      const matchesTerm = !term || haystack.includes(term);
      const matchesFocus = focusMode === 'all'
        || (focusMode === 'quick' && Number.parseInt(course.duration) <= 20)
        || (focusMode === 'saved' && savedCourses.has(course.id))
        || (focusMode === 'todo' && !completedCourses.has(course.id));
      return matchesCategory && matchesLevel && matchesTerm && matchesFocus;
    });

    if (sortBy === 'featured') return forDisplay;

    return [...forDisplay].sort((a, b) => {
      if (sortBy === 'duration') return Number.parseInt(a.duration) - Number.parseInt(b.duration);
      if (sortBy === 'level') return (LEVEL_ORDER[a.level] ?? 99) - (LEVEL_ORDER[b.level] ?? 99);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [completedCourses, courses, focusMode, savedCourses, searchTerm, selectedCategory, selectedLevel, sortBy]);

  const roleIsMember = user?.role === 'member' && user?.isVerified === true && user?.isMemberActive === true;
  const canAccessAdmin = user?.role === 'admin';
  const accessLabel = canAccessAdmin ? 'Admin access' : roleIsMember ? 'Member access' : 'Member access required';

  // The whole component already returns the locked screen below for anyone who
  // is neither an Active Member nor an Admin, so no other role can ever reach
  // this code. canWatchVideo/handleWatchVideo exist as an explicit second guard
  // directly on the video feature itself, so video access stays correctly
  // restricted even if the page-level gate above is ever changed later.
  const canWatchVideo = roleIsMember || canAccessAdmin;

  const closeVideo = () => {
    setActiveVideo(null);
    if (videoHistoryPushedRef.current) {
      videoHistoryPushedRef.current = false;
      window.history.back();
    }
  };

  useEffect(() => {
    if (!activeVideo || !canWatchVideo) return undefined;

    window.history.pushState({ ...(window.history.state || {}), forgeVideoModal: true }, '', window.location.href);
    videoHistoryPushedRef.current = true;

    const handlePopState = () => {
      videoHistoryPushedRef.current = false;
      setActiveVideo(null);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') handlePopState();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeVideo, canWatchVideo]);

  const normalizeVideoUrl = (value) => String(value || '').trim() || DEFAULT_VIDEO_URL;

  const handleWatchVideo = (course) => {
    if (!canWatchVideo) return;
    setActiveVideo({ ...course, videoUrl: normalizeVideoUrl(course.videoUrl), videoSources: course.videoSources || [normalizeVideoUrl(course.videoUrl)] });
  };

 const handleAddWorkout = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = form.get('title')?.toString().trim();
    if (!title) return;
    const imageFile = form.get('imageFile');
    const imageUrl = form.get('imageUrl')?.toString().trim();
    const newWorkout = {
      id: Date.now(),
      title,
      category: form.get('category')?.toString() || 'Strength & Hypertrophy',
      duration: form.get('duration')?.toString() || '12 mins',
      level: form.get('level')?.toString() || 'Intermediate',
      muscleGroup: form.get('muscleGroup')?.toString() || 'General',
      overview: form.get('overview')?.toString() || 'Fresh training focus added to the program library.',
      description: form.get('description')?.toString() || 'New workout available in the roster.',
      steps: ['Warm up intentionally.', 'Move with control.', 'Finish strong.'],
      videoUrl: form.get('videoUrl')?.toString() || DEFAULT_VIDEO_URL,
      imageUrl: imageFile instanceof File && imageFile.size > 0
        ? URL.createObjectURL(imageFile)
        : imageUrl || getWorkoutPhoto(title, form.get('muscleGroup')?.toString() || 'General')
    };
    const { data, error } = await supabase
  .from('courses')
  .insert({
    trainer_id: null,
    title: newWorkout.title,
    description: newWorkout.description,
    difficulty: newWorkout.level
  })
  .select()
  .single();

if (error) {
  console.error('SUPABASE COURSE INSERT ERROR:', error);
  alert(`Could not publish course: ${error.message}`);
  return;
}

const savedCourse = {
  ...newWorkout,
  id: data.id,
  trainerId: data.trainer_id
};

setCourses((current) => [savedCourse, ...current]);
    event.currentTarget.reset();
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSearchTerm('');
  };

const handleRemoveWorkout = async (courseId) => {
  // First remove enrollments linked to this course
  const { error: enrollmentError } = await supabase
    .from('enrollments')
    .delete()
    .eq('course_id', courseId);

  if (enrollmentError) {
    console.error('SUPABASE ENROLLMENT DELETE ERROR:', enrollmentError);
    alert(`Could not remove course enrollments: ${enrollmentError.message}`);
    return;
  }

  // Then remove the course
  const { error: courseError } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId);

  if (courseError) {
    console.error('SUPABASE COURSE DELETE ERROR:', courseError);
    alert(`Could not remove course: ${courseError.message}`);
    return;
  }

  // Remove the course from the page
  setCourses((current) =>
    current.filter((course) => course.id !== courseId)
  );

  // Remove it from the member's enrolled state
  setEnrolledCourses((current) => {
    const next = new Set(current);
    next.delete(courseId);
    return next;
  });

  setSelectedCourse((current) =>
    current?.id === courseId ? null : current
  );

  setActiveVideo((current) =>
    current?.id === courseId ? null : current
  );

  if (activeVideo?.id === courseId) {
    videoHistoryPushedRef.current = false;
  }
};
  const toggleCompleted = (courseId) => {
    setCompletedCourses((current) => {
      const next = new Set(current);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      localStorage.setItem('forge-completed', JSON.stringify([...next]));
      return next;
    });
  };

const handleEnroll = async (courseId) => {
  if (!user?.id) {
    alert('A valid member account is required to enroll.');
    return;
  }

  if (enrolledCourses.has(courseId)) {
    alert('You are already enrolled in this course.');
    return;
  }

  const { data: existingEnrollment, error: checkError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .maybeSingle();

  if (checkError) {
    console.error('SUPABASE ENROLLMENT CHECK ERROR:', checkError);
    alert(`Could not check enrollment: ${checkError.message}`);
    return;
  }

  if (existingEnrollment) {
    setEnrolledCourses((current) => {
      const next = new Set(current);
      next.add(courseId);
      return next;
    });

    alert('You are already enrolled in this course.');
    return;
  }

  const { data, error } = await supabase
    .from('enrollments')
    .insert({
      user_id: user.id,
      course_id: courseId
    })
    .select()
    .single();

  if (error) {
    console.error('SUPABASE ENROLLMENT ERROR:', error);
    alert(`Could not enroll: ${error.message}`);
    return;
  }

  setEnrolledCourses((current) => {
    const next = new Set(current);
    next.add(courseId);
    return next;
  });

  console.log('SUPABASE ENROLLMENT SUCCESS:', data);
  alert('Successfully enrolled in course!');
};
  const toggleSaved = (courseId) => {
    setSavedCourses((current) => {
      const next = new Set(current);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      localStorage.setItem('forge-saved', JSON.stringify([...next]));
      return next;
    });
  };

  const totalMinutes = courses.reduce((total, course) => total + (Number.parseInt(course.duration) || 0), 0);

  const sessionPlan = useMemo(() => {
    const goalMatches = courses.filter((course) => {
      if (composerGoal === 'conditioning') return /hiit|cardio|hyrox/i.test(course.category);
      if (composerGoal === 'mobility') return /mobility|recovery/i.test(course.category);
      return /strength|hypertrophy/i.test(course.category);
    });
    const duration = Number(composerMinutes);
    const withinTime = goalMatches.filter((course) => Number.parseInt(course.duration) <= duration);
    return (withinTime.length ? withinTime : goalMatches).slice(0, 3);
  }, [composerGoal, composerMinutes, courses]);

  const saveSessionPlan = () => {
    setSavedCourses((current) => {
      const next = new Set(current);
      sessionPlan.forEach((course) => next.add(course.id));
      localStorage.setItem('forge-saved', JSON.stringify([...next]));
      return next;
    });
    setComposerOpen(false);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSortBy('featured');
    setFocusMode('all');
  };

  if (!roleIsMember && !canAccessAdmin) {
    return (
      <div className="forge-app" style={pageShellStyle}>
        <header style={headerStyle}>
          <div style={brandStyle}>Forge Fitness</div>
          <span style={statPillStyle}>Member access required</span>
        </header>
        <section data-testid="non-member-locked" style={accessGateStyle}>
          <h1 style={accessGateTitleStyle}>Your training library is locked</h1>
          <p style={accessGateTextStyle}>Active members can view workout guides, mark sessions complete, and watch training videos. Please activate a membership to continue.</p>
        </section>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .forge-app .course-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        @media (max-width: 1100px) {
          .forge-app .course-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .forge-app .metrics-bar { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 760px) {
          .forge-app .course-grid { grid-template-columns: 1fr; }
          .forge-app .library-toolbar { grid-template-columns: 1fr; }
          .forge-app .hero-shell { grid-template-columns: 1fr; }
          .forge-app .metrics-bar { grid-template-columns: 1fr 1fr; }
          .forge-app .modal-body { grid-template-columns: 1fr; }
          .forge-app .composer-choice-row { grid-template-columns: 1fr; }
          .forge-app .admin-form { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="forge-app" style={pageShellStyle}>
      <header style={headerStyle}>
        <div style={brandStyle}>Forge Fitness</div>
        <div style={headerActionsStyle}>
          <span style={statPillStyle}>{accessLabel}</span>
          <span style={statPillStyle}>{filteredCourses.length} {pluralise(filteredCourses.length, 'workout')}</span>
        </div>
      </header>

      <section className="hero-shell" style={heroStyle}>
        <div style={heroGlowStyle} />
        <div style={heroLinesStyle} />
        <div style={heroCopyStyle}>
          <p style={heroEyebrowStyle}>Forge performance system</p>
          <h1 className="hero-title" style={heroTitleStyle}>Train with intent.<br />Earn your edge.</h1>
          <p style={heroTextStyle}>A focused library of strength, conditioning, mobility, and HYROX sessions designed to make every minute count.</p>
        </div>
        <aside style={heroAsideStyle}>
          <span style={heroAsideLabelStyle}>Your next move</span>
          <p style={heroAsideTextStyle}>{completedCourses.size ? 'Keep the streak alive. One more session today.' : 'Choose a session, press play, and make the work count.'}</p>
          <button type="button" style={heroActionStyle} onClick={() => document.getElementById('training-library')?.scrollIntoView({ behavior: 'smooth' })}>
            Explore sessions <span aria-hidden="true">↓</span>
          </button>
          <button type="button" className="hero-secondary-action" style={heroSecondaryActionStyle} onClick={() => setComposerOpen(true)}>
            Build my session <span aria-hidden="true">✦</span>
          </button>
        </aside>
      </section>

      <div className="library-toolbar" style={toolbarStyle}>
        <input
          aria-label="Search workouts"
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search workouts, muscle groups, or programs"
          style={fieldStyle}
        />

        <select aria-label="Category filter" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} style={fieldStyle}>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <select aria-label="Level filter" value={selectedLevel} onChange={(event) => setSelectedLevel(event.target.value)} style={fieldStyle}>
          {levels.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div id="training-library" style={catalogStyle}>
        <main style={mainStyle}>
          {canAccessAdmin && (
            <section data-testid="admin-publishing-panel" style={adminPanelStyle}>
              <div style={adminTitleStyle}>Admin publishing panel</div>
              <p style={adminSubtitleStyle}>Publish a workout with a hosted image URL or upload artwork directly from your desktop.</p>
              <form className="admin-form" style={adminFormStyle} onSubmit={handleAddWorkout}>
                <input name="title" required placeholder="Workout title" style={adminInputStyle} />
                <input name="category" required placeholder="Category" style={adminInputStyle} />
                <input name="duration" placeholder="Duration, e.g. 18 mins" style={adminInputStyle} />
                <select name="level" defaultValue="Intermediate" style={adminInputStyle}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
                <input name="muscleGroup" placeholder="Muscle group" style={adminInputStyle} />
                <input name="imageUrl" type="url" placeholder="Image URL (optional)" style={adminInputStyle} />
                <input name="imageFile" type="file" accept="image/*" style={{ ...adminInputStyle, ...adminFullWidthStyle }} />
                <input name="videoUrl" type="url" placeholder="Video URL (optional)" style={{ ...adminInputStyle, ...adminFullWidthStyle }} />
                <textarea name="description" required placeholder="Workout description" rows={3} style={{ ...adminInputStyle, ...adminFullWidthStyle, resize: 'vertical' }} />
                <button type="submit" style={{ ...primaryButtonStyle, ...adminFullWidthStyle }}>Publish workout</button>
              </form>
              <div style={adminListStyle}>
                {courses.map((course) => (
                  <div key={course.id} style={adminRowStyle}>
                    <strong style={{ color: '#fff' }}>{course.title}</strong>
                    <button type="button" onClick={() => handleRemoveWorkout(course.id)} style={removeButtonStyle}>Remove</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div style={resultsHeaderStyle}>
            <div className="library-controls" style={libraryControlsStyle}>
              <div>
                <div style={resultsTitleStyle}>Training library</div>
                <div style={resultsCountStyle}>{filteredCourses.length} {pluralise(filteredCourses.length, 'session')} ready for you</div>
              </div>
              <div className="library-controls" style={libraryControlsStyle}>
                <select aria-label="Sort workouts" value={sortBy} onChange={(event) => setSortBy(event.target.value)} style={{ ...fieldStyle, width: '180px', fontSize: '13px' }}>
                  <option value="featured">Featured</option>
                  <option value="duration">Duration</option>
                  <option value="level">Level</option>
                  <option value="title">Title</option>
                </select>
              </div>
            </div>
            <div style={focusBarStyle}>
              <button className="focus-chip" type="button" onClick={() => setFocusMode('all')} style={focusChipStyle(focusMode === 'all')}>All sessions</button>
              <button className="focus-chip" type="button" onClick={() => setFocusMode('quick')} style={focusChipStyle(focusMode === 'quick')}>Quick wins</button>
              <button className="focus-chip" type="button" onClick={() => setFocusMode('todo')} style={focusChipStyle(focusMode === 'todo')}>To complete</button>
              <button className="focus-chip" type="button" onClick={() => setFocusMode('saved')} style={focusChipStyle(focusMode === 'saved')}>Saved</button>
              {(searchTerm || selectedCategory !== 'All' || selectedLevel !== 'All' || focusMode !== 'all') && (
                <button type="button" onClick={resetFilters} style={clearFiltersStyle}>Clear filters</button>
              )}
            </div>
          </div>

          <div className="metrics-bar" style={metricsBarStyle}>
            <div className="metric-style" style={metricStyle}><span style={metricLabelStyle}>Library</span><span style={metricValueStyle}>{courses.length}</span></div>
            <div className="metric-style" style={metricStyle}><span style={metricLabelStyle}>Completed</span><span style={metricValueStyle}>{completedCourses.size}</span></div>
            <div className="metric-style" style={metricStyle}><span style={metricLabelStyle}>Saved</span><span style={metricValueStyle}>{savedCourses.size}</span></div>
            <div className="metric-style" style={metricStyle}><span style={metricLabelStyle}>Total minutes</span><span style={metricValueStyle}>{totalMinutes}</span></div>
          </div>

          <div className="course-grid" style={courseGridStyle}>
            {filteredCourses.length === 0 ? (
              <div style={emptyStateStyle}>
                <strong>No workouts found</strong>
                <span>Try another search or clear your filters.</span>
                <button type="button" onClick={resetFilters} style={clearFiltersStyle}>Clear filters</button>
              </div>
            ) : filteredCourses.map((course, index) => (
              <article key={course.id} className="course-card" style={courseCardStyle}>
                <div style={imageWrapStyle}>
                  <img src={course.imageUrl} alt={course.title} style={courseImageStyle} />
                  <span style={sessionIndexStyle}>SESSION {String(index + 1).padStart(2, '0')}</span>
                  <button type="button" onClick={() => setSelectedCourse(course)} style={guideButtonStyle}>
                    View workout guide ↗
                  </button>
                </div>
                <div style={courseBodyStyle}>
                  <div style={courseMetaStyle}>
                    <span style={categoryPillStyle}>{course.category}</span>
                    <span>{course.duration}</span>
                  </div>
                  <h3 style={courseTitleStyle}>{course.title}</h3>
                  <div style={muscleGroupStyle}>{course.muscleGroup}</div>
                  <p style={courseOverviewStyle}>{course.description}</p>
                  <div className="course-actions" style={courseActionsStyle}>
                    <strong style={{ marginRight: 'auto' }}>{course.level}</strong>
                    <button
                      type="button"
                      onClick={() => toggleCompleted(course.id)}
                      style={completeButtonStyle(completedCourses.has(course.id))}
                    >
                      {completedCourses.has(course.id) ? 'Completed' : 'Mark complete'}
                    </button>
                    <button type="button" onClick={() => toggleSaved(course.id)} style={saveButtonStyle(savedCourses.has(course.id))}>
                      {savedCourses.has(course.id) ? 'Saved' : 'Save'}
                    </button>
<button
  type="button"
  onClick={() => handleEnroll(course.id)}
  disabled={enrolledCourses.has(course.id)}
>
  {enrolledCourses.has(course.id) ? 'Enrolled' : 'Enroll'}
</button>       <button type="button" onClick={() => handleWatchVideo(course)} style={videoButtonStyle}>Watch video</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>

      {selectedCourse && (
        <div style={modalBackdropStyle} onClick={() => setSelectedCourse(null)}>
          <div style={modalCardStyle} onClick={(event) => event.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{selectedCourse.title}</h2>
              <button type="button" onClick={() => setSelectedCourse(null)} style={{ ...primaryButtonStyle, padding: '8px 12px' }}>Close</button>
            </div>
            <div className="modal-body" style={modalBodyStyle}>
              <img src={selectedCourse.imageUrl} alt={selectedCourse.title} style={modalImageStyle} />
              <div>
                <div style={courseStatsStyle}>
                  <span style={statChipStyle}>{selectedCourse.category}</span>
                  <span style={statChipStyle}>{selectedCourse.duration}</span>
                  <span style={statChipStyle}>{selectedCourse.level}</span>
                </div>
                <p style={{ ...courseOverviewStyle, marginTop: '16px', fontSize: '16px' }}>{selectedCourse.description}</p>
                <ul style={detailListStyle}>
                  {selectedCourse.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeVideo && (
        // Backdrop click closes the modal (clicking the dark overlay itself).
        <div style={videoModalStyle} onClick={closeVideo}>
          {/* stopPropagation here means clicks inside the modal box (including on
              the video/iframe itself) never bubble up to the backdrop's onClick,
              so the modal only closes via the backdrop or the ✕ button. */}
          <div style={videoCardStyle} onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={closeVideo}
              style={videoCloseButtonStyle}
              aria-label="Close video"
            >
              ✕
            </button>
            <div style={modalHeaderStyle}>
              <h2 style={modalTitleStyle}>{activeVideo.title}</h2>
            </div>
            {canWatchVideo ? (
             <SessionVideoPlayer
  key={activeVideo.id || activeVideo.title}
  sources={activeVideo.videoSources || [activeVideo.videoUrl]}
  targetSeconds={(Number.parseInt(activeVideo.duration) || 1) * 60}
  title={activeVideo.title}
/>
            ) : (
              <section style={accessGateStyle}>
                <h1 style={accessGateTitleStyle}>Member access required</h1>
                <p style={accessGateTextStyle}>Active members and admins can watch training videos. Please activate a membership to continue.</p>
              </section>
            )}
          </div>
        </div>
      )}

      {composerOpen && (
        <div style={modalBackdropStyle} onClick={() => setComposerOpen(false)}>
          <div style={composerCardStyle} onClick={(event) => event.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <p style={{ ...heroEyebrowStyle, color: '#00c8ff', marginBottom: '6px' }}>Forge session builder</p>
                <h2 style={modalTitleStyle}>Your next session, assembled.</h2>
              </div>
              <button type="button" onClick={() => setComposerOpen(false)} style={{ ...secondaryButtonStyle, padding: '8px 12px' }}>Close</button>
            </div>
            <div style={composerBodyStyle}>
              <div>
                <strong>What do you want to train?</strong>
                <div className="composer-choice-row" style={composerChoiceRowStyle}>
                  <button type="button" onClick={() => setComposerGoal('strength')} style={composerChoiceStyle(composerGoal === 'strength')}>Build strength</button>
                  <button type="button" onClick={() => setComposerGoal('conditioning')} style={composerChoiceStyle(composerGoal === 'conditioning')}>Raise conditioning</button>
                  <button type="button" onClick={() => setComposerGoal('mobility')} style={composerChoiceStyle(composerGoal === 'mobility')}>Move better</button>
                </div>
              </div>
              <div>
                <strong>How much time do you have?</strong>
                <div className="composer-choice-row" style={composerChoiceRowStyle}>
                  {['20', '30', '45'].map((minutes) => (
                    <button key={minutes} type="button" onClick={() => setComposerMinutes(minutes)} style={composerChoiceStyle(composerMinutes === minutes)}>{minutes} minutes</button>
                  ))}
                </div>
              </div>
              <div>
                <strong>Your Forge plan</strong>
                <div style={{ display: 'grid', gap: '9px', marginTop: '10px' }}>
                  {sessionPlan.length ? sessionPlan.map((course, index) => (
                    <div key={course.id} style={planItemStyle}>
                      <span><strong>{String(index + 1).padStart(2, '0')}</strong> {course.title}</span>
                      <span style={{ color: '#00c8ff', fontWeight: 900 }}>{course.duration}</span>
                    </div>
                  )) : <p style={accessGateTextStyle}>No matching sessions yet. Try another goal or time window.</p>}
                </div>
              </div>
              <button type="button" onClick={saveSessionPlan} disabled={!sessionPlan.length} style={{ ...primaryButtonStyle, width: '100%', padding: '14px' }}>
                Save this plan to my workouts
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}
