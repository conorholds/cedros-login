/**
 * Organization avatar component
 */
import type { OrgWithMembership } from '../../types';
import { sanitizeImageUrl } from '../../utils/sanitization';

export interface OrgAvatarProps {
  org: OrgWithMembership;
  size?: 'sm' | 'lg';
  className?: string;
}

export function OrgAvatar({ org, size = 'lg', className = '' }: OrgAvatarProps) {
  const sanitizedLogoUrl = sanitizeImageUrl(org.logoUrl);
  const sizeClass = size === 'lg' ? 'cedros-org-avatar-lg' : '';
  const imageClassName = ['cedros-org-avatar', sizeClass, className].filter(Boolean).join(' ');
  const placeholderClassName = ['cedros-org-avatar-placeholder', sizeClass, className]
    .filter(Boolean)
    .join(' ');
  if (sanitizedLogoUrl) {
    return (
      <img
        src={sanitizedLogoUrl}
        alt={org.name}
        className={imageClassName}
        referrerPolicy="no-referrer"
      />
    );
  }

  return <div className={placeholderClassName}>{org.name[0]?.toUpperCase() || '?'}</div>;
}
