import { Icon } from "./Icon";

export function IconButton({ label, path, onClick, active = false }: { label: string; path: string; onClick?: () => void; active?: boolean }) {
  return (
    <button className={`icon-button ${active ? "is-active" : ""}`} type="button" aria-label={label} title={label} onClick={onClick}>
      <Icon path={path} size={0.82} />
    </button>
  );
}

export function iconButtonLabel(label: string, path: string, onClick?: () => void, active = false) {
  return <IconButton label={label} path={path} onClick={onClick} active={active} />;
}
