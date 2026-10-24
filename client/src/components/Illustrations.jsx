// Brand illustration: a bridge joining a worker (left) and a hirer (right).
export function BridgeScene({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 480 320" role="img" aria-label="A bridge connecting a worker and a hirer" xmlns="http://www.w3.org/2000/svg">
      <rect width="480" height="320" rx="20" fill="#F1F7F3"/>
      <circle cx="396" cy="66" r="28" fill="#FDE9B8"/>
      <rect y="252" width="480" height="68" fill="#D6EADF"/>
      <path d="M20 280q20-10 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".8"/>
      <path d="M0 200h114v52H0zM366 200h114v52H366z" fill="#BFDCCB"/>
      <path d="M110 202Q240 80 370 202" fill="none" stroke="#176B4D" strokeWidth="10" strokeLinecap="round"/>
      <g stroke="#176B4D" strokeWidth="3" strokeLinecap="round"><path d="M160 164v32M200 147v49M240 141v55M280 147v49M320 164v32"/></g>
      <rect x="96" y="196" width="288" height="12" rx="6" fill="#0F4A35"/>
      {/* worker */}
      <rect x="44" y="164" width="34" height="38" rx="13" fill="#176B4D"/>
      <circle cx="61" cy="150" r="14" fill="#E9B98C"/>
      <path d="M44 148a17 15 0 0 1 34 0z" fill="#F59E0B"/>
      <rect x="41" y="146" width="40" height="5" rx="2.5" fill="#D97706"/>
      {/* hirer */}
      <rect x="402" y="164" width="34" height="38" rx="13" fill="#1F2937"/>
      <circle cx="419" cy="150" r="14" fill="#D9A273"/>
      <path d="M405 146a15 15 0 0 1 28 -4 7 7 0 0 1 -28 4z" fill="#1F2937"/>
      <rect x="412" y="176" width="14" height="18" rx="2" fill="#fff"/><path d="M415 181h8M415 185h8M415 189h5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
      {/* connection badge */}
      <circle cx="240" cy="108" r="17" fill="#F59E0B"/>
      <path d="m232 108 6 6 11-12" fill="none" stroke="#1F2937" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
