import React from 'react';

export default function TriageIllustration({ className = 'w-full max-w-md h-auto' }) {
  return (
    <svg
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="250" cy="200" r="160" fill="#EF4444" fillOpacity="0.12" />
      <circle cx="250" cy="200" r="120" fill="#F87171" fillOpacity="0.18" />

      {/* Emergency / Ambulance Siren badge */}
      <g transform="translate(210, 40)">
        <circle cx="40" cy="40" r="28" fill="#EF4444" />
        <path d="M40 22 L40 30" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <path d="M26 26 L32 32" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <path d="M54 26 L48 32" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <rect x="25" y="38" width="30" height="18" rx="4" fill="#FFFFFF" />
        <circle cx="40" cy="47" r="4" fill="#EF4444" />
      </g>

      {/* Triage Nurse / Desk Officer */}
      <g transform="translate(140, 110)">
        {/* Head */}
        <circle cx="110" cy="55" r="40" fill="#FFFFFF" />
        <circle cx="110" cy="50" r="34" fill="#FDE68A" />
        {/* Hair / Cap */}
        <path d="M78 45 C78 20, 142 20, 142 45 Z" fill="#DC2626" />
        {/* White cross on cap */}
        <rect x="105" y="27" width="10" height="3" rx="1" fill="#FFFFFF" />
        <rect x="108.5" y="23.5" width="3" height="10" rx="1" fill="#FFFFFF" />

        {/* Triage Uniform */}
        <path
          d="M55 200 L68 95 C75 88, 145 88, 152 95 L165 200 Z"
          fill="#1E3A8A"
        />
        {/* Collar & ID Badge */}
        <path d="M98 90 L110 120 L122 90 Z" fill="#FFFFFF" />
        <rect x="85" y="130" width="22" height="28" rx="4" fill="#FFFFFF" />
        <rect x="89" y="134" width="14" height="6" rx="2" fill="#EF4444" />
        <rect x="89" y="144" width="14" height="3" rx="1" fill="#94A3B8" />
        <rect x="89" y="149" width="10" height="3" rx="1" fill="#94A3B8" />
      </g>

      {/* Triage Priority Queue Board */}
      <g transform="translate(290, 170)">
        <rect x="0" y="0" width="120" height="135" rx="12" fill="#FFFFFF" filter="drop-shadow(0px 8px 20px rgba(0,0,0,0.15))" />
        <rect x="14" y="16" width="92" height="12" rx="4" fill="#1E293B" />
        
        {/* Priority 1: Red Emergency */}
        <rect x="14" y="40" width="16" height="16" rx="4" fill="#EF4444" />
        <rect x="36" y="43" width="70" height="10" rx="3" fill="#FEE2E2" />

        {/* Priority 2: Yellow Urgent */}
        <rect x="14" y="66" width="16" height="16" rx="4" fill="#F59E0B" />
        <rect x="36" y="69" width="60" height="10" rx="3" fill="#FEF3C7" />

        {/* Priority 3: Green Routine */}
        <rect x="14" y="92" width="16" height="16" rx="4" fill="#10B981" />
        <rect x="36" y="95" width="50" height="10" rx="3" fill="#D1FAE5" />
      </g>

      {/* Dynamic vital ECG line */}
      <path
        d="M50 320 L120 320 L135 290 L150 350 L165 305 L180 325 L190 320 L450 320"
        stroke="#EF4444"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      />
    </svg>
  );
}
