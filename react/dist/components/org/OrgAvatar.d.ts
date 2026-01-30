import { OrgWithMembership } from '../../types';
export interface OrgAvatarProps {
    org: OrgWithMembership;
    size?: 'sm' | 'lg';
    className?: string;
}
export declare function OrgAvatar({ org, size, className }: OrgAvatarProps): import("react/jsx-runtime").JSX.Element;
