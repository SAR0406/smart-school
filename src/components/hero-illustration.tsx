export function HeroIllustration() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <div className="relative mx-auto h-full max-w-6xl">
        <svg
          viewBox="0 0 1155 678"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-auto w-full opacity-20"
        >
          <g clipPath="url(#clip0_1_2)">
            <path
              d="M329.75 678H-254V-254H813.5V678H329.75Z"
              fill="url(#paint0_radial_1_2)"
            />
            <path
              d="M741.75 678H1325V-254H258V678H741.75Z"
              fill="url(#paint1_radial_1_2)"
            />
          </g>
          <defs>
            <radialGradient
              id="paint0_radial_1_2"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(279.75 212) rotate(90) scale(536)"
            >
              <stop stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </radialGradient>
            <radialGradient
              id="paint1_radial_1_2"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(791.75 212) rotate(90) scale(536)"
            >
              <stop stopColor="hsl(255, 80%, 60%)" stopOpacity="0.7" />
              <stop offset="1" stopColor="hsl(255, 80%, 60%)" stopOpacity="0" />
            </radialGradient>
            <clipPath id="clip0_1_2">
              <rect width="1155" height="678" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
  );
}
