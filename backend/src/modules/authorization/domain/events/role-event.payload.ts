import { Role } from '../role.aggregate';
import { type ActorHeaders } from '../../../../shared/types/actor-headers';

export type RoleEventPayload = {
  headers: ActorHeaders;
  role: {
    id: string;
    name: string;
    permissions: string[];
    isSuperAdmin: boolean;
    createdAt: string;
  };
};

export const roleEventPayload = (
  role: Role,
  headers: ActorHeaders,
): RoleEventPayload => ({
  headers,
  role: {
    id: role.getId(),
    name: role.getName(),
    permissions: role.getPermissions(),
    isSuperAdmin: role.getIsSuperAdmin(),
    createdAt: role.getCreatedAt().toISOString(),
  },
});
