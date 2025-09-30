import { useContext } from 'react';
import { AuthContext, UserRole } from '../types';

export const usePermissions = (moduleKey: string) => {
    const auth = useContext(AuthContext);
    const user = auth?.user;

    if (!user) {
        return { canView: false, canAdd: false, canEdit: false, canDelete: false };
    }

    const permissions = user.permissions?.[moduleKey];

    return {
        canView: !!permissions?.view,
        canAdd: !!permissions?.add,
        canEdit: !!permissions?.edit,
        canDelete: !!permissions?.delete,
    };
};