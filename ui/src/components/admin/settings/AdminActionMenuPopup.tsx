import { useCallback, useRef, type CSSProperties, type KeyboardEvent } from 'react';

import { useExternalEffect } from '../../../hooks/effects';

export interface AdminActionMenuItem {
  label: string;
  destructive?: boolean;
  onSelect: () => void;
}

interface ActionMenuPopupProps {
  close: (restoreFocus?: boolean) => void;
  items: AdminActionMenuItem[];
  menuId: string;
  menuStyle: CSSProperties;
  side: 'bottom' | 'top';
  setMenuElement: (element: HTMLDivElement | null) => void;
}

export function ActionMenuPopup({
  close,
  items,
  menuId,
  menuStyle,
  side,
  setMenuElement,
}: ActionMenuPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const typeaheadRef = useRef({ value: '', at: 0 });
  const assignPopupRef = useCallback(
    (element: HTMLDivElement | null) => {
      popupRef.current = element;
      setMenuElement(element);
    },
    [setMenuElement]
  );

  useExternalEffect(() => {
    popupRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
  }, []);

  return (
    <div
      ref={assignPopupRef}
      id={menuId}
      className="cedros-dropdown-menu__content"
      role="menu"
      data-side={side}
      style={menuStyle}
      onKeyDown={(event) => {
        if (event.key === 'Tab') close(true);
        else handleMenuKeyDown(event, typeaheadRef);
      }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`cedros-dropdown-menu__item ${item.destructive ? 'cedros-dropdown-menu__item--danger' : ''}`.trim()}
          role="menuitem"
          onClick={() => {
            close(true);
            item.onSelect();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function handleMenuKeyDown(
  event: KeyboardEvent<HTMLDivElement>,
  typeaheadRef: React.MutableRefObject<{ value: string; at: number }>
) {
  const items = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')
  );
  const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
    handleTypeahead(event, items, currentIndex, typeaheadRef);
    return;
  }

  event.preventDefault();
  if (event.key === 'Home') items[0]?.focus();
  else if (event.key === 'End') items.at(-1)?.focus();
  else {
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    items[(currentIndex + direction + items.length) % items.length]?.focus();
  }
}

function handleTypeahead(
  event: KeyboardEvent<HTMLDivElement>,
  items: HTMLButtonElement[],
  currentIndex: number,
  typeaheadRef: React.MutableRefObject<{ value: string; at: number }>
) {
  if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey) return;
  const now = Date.now();
  const previous = typeaheadRef.current;
  const value = `${now - previous.at < 700 ? previous.value : ''}${event.key}`.toLocaleLowerCase();
  typeaheadRef.current = { value, at: now };
  const ordered = [...items.slice(currentIndex + 1), ...items.slice(0, currentIndex + 1)];
  const match = ordered.find((item) =>
    item.textContent?.trim().toLocaleLowerCase().startsWith(value)
  );
  if (!match) return;
  event.preventDefault();
  match.focus();
}
