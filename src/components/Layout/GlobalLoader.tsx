'use client';

import { useEffect, useState } from 'react';
import { Text } from '@mantine/core';
import { useLoader } from '@/context/LoaderContext';

// Rotating messages based on context keyword
const MESSAGES: Record<string, string[]> = {
  publish: [
    'Publishing your job opening…',
    'Uploading to the platform…',
    'Almost live…',
  ],
  draft: [
    'Saving your draft…',
    'Keeping it safe for later…',
    'Draft secured…',
  ],
  update: [
    'Updating job details…',
    'Applying your changes…',
    'Syncing with the platform…',
  ],
  jobs: [
    'Fetching latest opportunities…',
    'Loading job listings…',
    'Finding the best matches…',
  ],
  drafts: [
    'Loading your saved drafts…',
    'Retrieving your work…',
    'Almost there…',
  ],
  home: [
    'Loading your job board…',
    'Fetching fresh listings…',
    'Setting things up…',
  ],
  default: [
    'Loading…',
    'Hang tight…',
    'Almost there…',
  ],
};

function getMessages(msg: string): string[] {
  const key = msg.toLowerCase();
  for (const [k, v] of Object.entries(MESSAGES)) {
    if (key.includes(k)) return v;
  }
  return MESSAGES.default;
}

// Animated briefcase + orbit loader
function BriefcaseLoader() {
  return (
    <div style={{ position: 'relative', width: 80, height: 80 }}>
      {/* Outer orbit ring */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: '2px solid transparent',
        borderTopColor: '#7B3FF2',
        borderRightColor: '#7B3FF240',
        animation: 'spin 1s linear infinite',
      }} />
      {/* Inner orbit ring */}
      <div style={{
        position: 'absolute', inset: 8, borderRadius: '50%',
        border: '2px solid transparent',
        borderBottomColor: '#9b6dff',
        borderLeftColor: '#9b6dff40',
        animation: 'spin 0.75s linear infinite reverse',
      }} />
      {/* Center icon */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="7" width="20" height="14" rx="2" stroke="#7B3FF2" strokeWidth="2"/>
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="#7B3FF2" strokeWidth="2"/>
          <line x1="12" y1="12" x2="12" y2="16" stroke="#7B3FF2" strokeWidth="2" strokeLinecap="round"/>
          <line x1="10" y1="14" x2="14" y2="14" stroke="#7B3FF2" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}

// Animated dots
function Dots() {
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: '50%',
          backgroundColor: '#7B3FF2',
          animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

export function GlobalLoader() {
  const { isLoading, message } = useLoader();
  const [displayMsg, setDisplayMsg] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  // Fade in/out
  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      const msgs = getMessages(message);
      setDisplayMsg(msgs[0]);
      setMsgIndex(0);
    } else {
      // Small fade-out delay
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [isLoading, message]);

  // Cycle through messages every 800ms
  useEffect(() => {
    if (!isLoading) return;
    const msgs = getMessages(message);
    const interval = setInterval(() => {
      setMsgIndex(i => {
        const next = (i + 1) % msgs.length;
        setDisplayMsg(msgs[next]);
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [isLoading, message]);

  if (!visible) return null;

  return (
    <>
      {/* CSS keyframes injected once */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes dotPulse {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(248, 249, 250, 0.88)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: isLoading ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          animation: 'fadeIn 0.3s ease',
        }}>
          <BriefcaseLoader />

          <div style={{ textAlign: 'center' }}>
            <Text
              fw={600}
              size="md"
              c="violet.7"
              style={{
                transition: 'opacity 0.3s ease',
                minHeight: 28,
              }}
            >
              {displayMsg}
            </Text>
            <Dots />
          </div>
        </div>
      </div>
    </>
  );
}