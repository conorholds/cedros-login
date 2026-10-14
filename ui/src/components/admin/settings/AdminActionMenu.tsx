import { useCallback, useId, useRef, useState } from 'react';

import { useExternalEffect } from '../../../hooks/effects';
import { useCedrosLoginAdminOverlay } from '../../../admin/CedrosLoginAdminOverlayContext';
import { ActionMenuPopup, type AdminActionMenuItem } from './AdminActionMenuPopup';

export type { AdminActionMenuItem } from './AdminActionMenuPopup';

interface AdminActionMenuProps {
  label: string;
  items: AdminActionMenuItem[];
}

export function AdminActionMenu({ label, items }: AdminActionMenuProps) {
  const overlay = useCedrosLoginAdminOverlay();
  const ownerId = useId();
  const { close, isOpen, menuId, position, setMenuElement, toggle, triggerRef } =
    useAdminActionMenu(items);
  const { side, style } = position;

  useExternalEffect(() => {
    if (!isOpen || !overlay) return undefined;
    overlay.show(
      ownerId,
      <ActionMenuPopup
        close={close}
        items={items}
        menuId={menuId}
        menuStyle={style}
        side={side}
        setMenuElement={setMenuElement}
      />
    );
    return () => overlay.hide(ownerId);
  }, [close, isOpen, items, menuId, overlay, ownerId, setMenuElement, side, style]);

  return (
    <div className="cedros-dropdown-menu">
      <button
        ref={triggerRef}
        type="button"
        className="cedros-data-row-actions__icon"
        aria-label={label}
        title={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={toggle}
      >
        <MoreIcon />
      </button>
      {isOpen && !overlay && (
        <ActionMenuPopup
          close={close}
          items={items}
          menuId={menuId}
          menuStyle={style}
          side={side}
          setMenuElement={setMenuElement}
        />
      )}
    </div>
  );
}

function useAdminActionMenu(items: AdminActionMenuItem[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({
    side: 'bottom',
    style: { right: 0, top: 0 },
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const setMenuElement = useCallback((element: HTMLDivElement | null) => {
    menuRef.current = element;
  }, []);

  const close = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
      return;
    }
    const trigger = triggerRef.current;
    const rect = trigger?.getBoundingClientRect();
    if (trigger && rect) {
      setPosition(calculateMenuPosition(rect, items));
    }
    setIsOpen(true);
  }, [close, isOpen, items]);

  useExternalEffect(() => {
    if (!isOpen) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close();
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(true);
      }
    };
    const onViewportChange = () => close();
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onViewportChange);
      window.removeEventListener('scroll', onViewportChange, true);
    };
  }, [close, isOpen]);

  return { close, isOpen, menuId, position, setMenuElement, toggle, triggerRef };
}

interface MenuPosition {
  side: 'bottom' | 'top';
  style: { left?: number; right?: number; top?: number; bottom?: number };
}

function calculateMenuPosition(rect: DOMRect, items: AdminActionMenuItem[]): MenuPosition {
  const estimatedHeight = Math.min(320, items.length * 32 + 8);
  const longestLabel = Math.max(...items.map((item) => item.label.length), 0);
  const estimatedWidth = Math.min(320, Math.max(176, longestLabel * 8 + 24));
  const spaceBelow = window.innerHeight - rect.bottom;
  const openAbove = spaceBelow < estimatedHeight && rect.top > spaceBelow;
  const horizontal =
    rect.right < estimatedWidth
      ? { left: Math.max(0, rect.left) }
      : { right: Math.max(0, window.innerWidth - rect.right) };
  return openAbove
    ? { side: 'top', style: { ...horizontal, bottom: window.innerHeight - rect.top } }
    : { side: 'bottom', style: { ...horizontal, top: rect.bottom } };
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
    </svg>
  );
}
