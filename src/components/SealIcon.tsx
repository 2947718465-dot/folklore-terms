interface SealIconProps {
  char: string;
  color: string;
  size?: number;
}

export function SealIcon({ char, color, size = 32 }: SealIconProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: color + '18',
        border: `1.5px solid ${color}`,
        fontFamily: 'var(--font-serif)',
        fontSize: size * 0.48,
        fontWeight: 500,
        color: color,
        lineHeight: 1,
        userSelect: 'none',
      }}
      title={char}
      role="img"
      aria-label={char}
    >
      {char}
    </span>
  );
}
