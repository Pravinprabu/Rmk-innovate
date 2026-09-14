import React from 'react';

export default function DoctorIllustration({ className = 'w-full max-w-md h-auto' }) {
  return (
    <svg
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="250" cy="200" r="160" fill="#5F8D72" fillOpacity="0.15" />
      <circle cx="250" cy="200" r="120" fill="#DCE9DF" fillOpacity="0.3" />

      {/* Doctor character silhouette / illustration */}
      <g transform="translate(150, 70)">
        {/* Head */}
        <circle cx="100" cy="65" r="45" fill="#FFFFFF" />
        <circle cx="100" cy="60" r="38" fill="#FDE68A" />
        {/* Hair */}
        <path d="M65 50 C65 25, 135 25, 135 50 C130 35, 70 35, 65 50 Z" fill="#26332B" />

        {/* Stethoscope around neck */}
        <path
          d="M80 95 C80 140, 120 140, 120 95"
          stroke="#26332B"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="100" cy="150" r="10" fill="#E3E7E3" stroke="#26332B" strokeWidth="4" />
        <path d="M100 135 L100 142" stroke="#26332B" strokeWidth="5" />

        {/* Doctor Coat / Body */}
        <path
          d="M40 230 L55 110 C60 100, 140 100, 145 110 L160 230 Z"
          fill="#FFFFFF"
        />
        {/* Inner Scrub */}
        <path d="M85 105 L100 145 L115 105 Z" fill="#315A43" />

        {/* Cross Badge */}
        <rect x="65" y="140" width="16" height="5" rx="2" fill="#C95C5C" />
        <rect x="70.5" y="134.5" width="5" height="16" rx="2" fill="#C95C5C" />
      </g>

      {/* Medical Chart / Tablet */}
      <g transform="translate(300, 190)">
        <rect x="0" y="0" width="90" height="120" rx="10" fill="#FFFFFF" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.06))" />
        <rect x="15" y="20" width="60" height="8" rx="4" fill="#5F8D72" />
        <rect x="15" y="38" width="50" height="6" rx="3" fill="#6B756E" />
        <rect x="15" y="52" width="55" height="6" rx="3" fill="#E3E7E3" />
        <rect x="15" y="66" width="40" height="6" rx="3" fill="#E3E7E3" />
        <circle cx="65" cy="95" r="12" fill="#4F8A63" />
        <path d="M60 95 L63 98 L70 91" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Heartbeat pulse graphic */}
      <path
        d="M60 320 L130 320 L145 295 L160 345 L175 310 L190 325 L200 320 L440 320"
        stroke="#5F8D72"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}

