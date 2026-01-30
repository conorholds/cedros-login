import { CreateOrgRequest } from '../../types';
export interface CreateOrgFormProps {
    isLoading: boolean;
    onSubmit: (data: CreateOrgRequest) => Promise<void>;
    onCancel: () => void;
}
export declare function CreateOrgForm({ isLoading, onSubmit, onCancel }: CreateOrgFormProps): import("react/jsx-runtime").JSX.Element;
