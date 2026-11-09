import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../../domain/users.repository';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../../domain/user.aggregate';
import { UserMapper } from '../mappers/user.mapper';
import { MikroUser } from '../entities/mikro-user.entity';

@Injectable()
export class MikroUsersRepository implements IUsersRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async findById(id: string): Promise<User | null> {
    const mikroUser = await this.entityManager.findOne(MikroUser, { id });

    return mikroUser ? UserMapper.toDomain(mikroUser) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const mikroUser = await this.entityManager.findOne(MikroUser, { email });

    return mikroUser ? UserMapper.toDomain(mikroUser) : null;
  }

  public async existsByEmail(email: string): Promise<boolean> {
    const mikroUser = await this.entityManager.findOne(MikroUser, { email });

    return !!mikroUser;
  }

  public async create(user: User): Promise<User> {
    const mikroUser = UserMapper.toMikroOrm(user);

    this.entityManager.persist(mikroUser);

    return user;
  }

  public async update(user: User): Promise<void> {
    const ref = this.entityManager.getReference(MikroUser, user.getId());

    this.entityManager.assign(ref, {
      firstName: user.getFirstName(),
      lastName: user.getLastName(),
      email: user.getEmail(),
      roleIds: user.getRoleIds(),
    });
  }
}
