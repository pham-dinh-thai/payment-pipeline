import { Role } from './role.aggregate';

export interface IRolesRepository {
  findAll(): Promise<Role[]>;

  findById(id: string): Promise<Role | null>;

  findByName(name: string): Promise<Role | null>;

  create(role: Role): Promise<Role>;

  update(role: Role): Promise<Role>;
}

export const ROLES_REPOSITORY = 'IRolesRepository';
