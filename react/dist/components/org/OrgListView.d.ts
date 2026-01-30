import { OrgWithMembership } from '../../types';
export interface OrgListViewProps {
    orgs: OrgWithMembership[];
    activeOrg: OrgWithMembership | null;
    isLoading: boolean;
    onSelect: (orgId: string) => void;
    onCreateClick?: () => void;
}
export declare function OrgListView({ orgs, activeOrg, isLoading, onSelect, onCreateClick, }: OrgListViewProps): import("react/jsx-runtime").JSX.Element;
