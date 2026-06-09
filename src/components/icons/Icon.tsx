export function Icon({ path, size = 1 }: { path: string; size?: number | string }) {
  const dimension = typeof size === "number" ? `${1.5 * size}rem` : size;
  return (
    <svg viewBox="0 0 24 24" width={dimension} height={dimension} aria-hidden="true" focusable="false">
      <path d={path} fill="currentColor" />
    </svg>
  );
}
