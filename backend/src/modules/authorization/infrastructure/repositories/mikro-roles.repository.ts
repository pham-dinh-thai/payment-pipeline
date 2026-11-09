import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EntityManager,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
import { type IRolesRepository } from '../../domain/roles.repository';
import { Role } from '../../domain/role.aggregate';
import { RoleMapper } from '../mappers/role.mapper';
import { MikroRole } from '../entities/mikro-role.entity';

@Injectable()
export class MikroRolesRepository implements IRolesRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async findAll(): Promise<Role[]> {
    const mikroRoles = await this.entityManager.findAll(MikroRole, {
      orderBy: { createdAt: 'desc' },
    });

    return mikroRoles.map((mikroRole) => RoleMapper.toDomain(mikroRole));
  }

  public async findById(id: string): Promise<Role | null> {
    const mikroRole = await this.entityManager.findOne(MikroRole, { id });

    return mikroRole ? RoleMapper.toDomain(mikroRole) : null;
  }

  public async findByName(name: string): Promise<Role | null> {
    const mikroRole = await this.entityManager.findOne(MikroRole, { name });

    return mikroRole ? RoleMapper.toDomain(mikroRole) : null;
  }

  public create(role: Role): Promise<Role> {
    return this.persistRole(new MikroRole(), role, true);
  }

  public async update(role: Role): Promise<Role> {
    const mikroRole = await this.entityManager.findOne(MikroRole, {
      id: role.getId(),
    });

    if (!mikroRole) {
      throw new NotFoundException(`Role id ${role.getId()} not found`);
    }

    return this.persistRole(mikroRole, role, false);
  }

  private async persistRole(
    mikroRole: MikroRole,
    role: Role,
    insert: boolean,
  ): Promise<Role> {
    try {
      RoleMapper.assign(mikroRole, role);

      if (insert) {
        this.entityManager.persist(mikroRole);
      }

      await this.entityManager.flush();

      return RoleMapper.toDomain(mikroRole);
    } catch (e) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException('Role name already exists');
      }

      throw e;
    }
  }
}
