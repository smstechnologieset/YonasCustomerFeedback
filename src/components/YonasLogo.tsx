import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function YonasLogo({ className = "", size = "md" }: LogoProps) {
  const dimensions = {
    sm: "h-8 w-auto",
    md: "h-12 w-auto",
    lg: "h-20 w-auto",
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Premium Stethoscope + Phone Icon in vectors */}
      <svg
        className={dimensions[size]}
        viewBox="0 0 200 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8C6B12" />
          </linearGradient>
          <linearGradient id="metallicGold" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8C6B13" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#F3E5AB" />
            <stop offset="100%" stopColor="#C5A85C" />
          </linearGradient>
          <filter id="glowGold" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Smartphone Outline (Stethoscope Masterpiece Chestpiece) */}
        <g id="phone-chestpiece">
          {/* Smartphone outer body */}
          <rect
            x="20"
            y="10"
            width="34"
            height="58"
            rx="5"
            fill="#121212"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />
          {/* Speaker grill */}
          <line
            x1="32"
            y1="14"
            x2="42"
            y2="14"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Home button circle */}
          <circle cx="37" cy="62" r="2.5" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
          {/* Inner phone screen display */}
          <rect
            x="24"
            y="18"
            width="26"
            height="38"
            fill="#030303"
            stroke="#FFFFFF"
            strokeWidth="0.5"
          />
          {/* Golden heartbeat or repair wrench pulse inside screen */}
          <path
            d="M 27 37 L 31 37 L 33 28 L 36 44 L 38 34 L 40 37 L 47 37"
            stroke="url(#goldGradient)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>

        {/* Stethoscope Binaural Tubes */}
        <g id="stethoscope-tubes">
          {/* Left binaural branch starting from side of the phone going down and looping */}
          <path
            d="M 20 39 Q 5 39 12 55 Q 20 71 37 84 Q 54 71 62 55 Q 69 39 54 39"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tubing stem extending from the loop bottom center */}
          <path
            d="M 37 84 Q 37 94 48 93 Q 66 92 73 68"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Ear tips or connection nodes with subtle gold color */}
          <circle cx="20" cy="39" r="2" fill="url(#goldGradient)" />
          {/* Stethoscope bell connector circle */}
          <circle cx="73" cy="68" r="4.5" fill="#121212" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="73" cy="68" r="2" fill="url(#goldGradient)" />
        </g>

        {/* YONAS MOBILE TEXT GROUP */}
        <g id="yonas-mobile-text">
          {/* YONAS: bold, sharp serif tall font */}
          <text
            x="80"
            y="48"
            fill="#FFFFFF"
            fontFamily="var(--font-display), 'Impact', 'Inter', sans-serif"
            fontWeight="bold"
            fontSize="30"
            letterSpacing="1"
          >
            YONAS
          </text>
          
          {/* MOBILE: premium metallic gold gradient capital letters */}
          <text
            x="81"
            y="70"
            fill="url(#metallicGold)"
            fontFamily="var(--font-sans), 'Arial Black', sans-serif"
            fontWeight="900"
            fontSize="18"
            letterSpacing="0.8"
          >
            MOBILE
          </text>
        </g>
      </svg>
    </div>
  );
}
