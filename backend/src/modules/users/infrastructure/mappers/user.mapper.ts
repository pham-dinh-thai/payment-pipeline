import { User } from '../../domain/user.aggregate';
import { MikroUser } from '../entities/mikro-user.entity';

export class UserMapper {
  public static toDomain(mikroUser: MikroUser): User {
    return User.fromPersistent({
      id: mikroUser.id,
      firstName: mikroUser.firstName,
      lastName: mikroUser.lastName,
      email: mikroUser.email,
      roleIds: mikroUser.roleIds,
      createdAt: mikroUser.createdAt,
      updatedAt: mikroUser.updatedAt,
    });
  }

  public static toMikroOrm(user: User): MikroUser {
    const mikroUser = new MikroUser();

    UserMapper.assign(mikroUser, user);

    return mikroUser;
  }

  public static assign(mikroUser: MikroUser, user: User): void {
    mikroUser.id = user.getId();
    mikroUser.firstName = user.getFirstName();
    mikroUser.lastName = user.getLastName();
    mikroUser.email = user.getEmail();
    mikroUser.roleIds = user.getRoleIds();
    mikroUser.createdAt = user.getCreatedAt();
    mikroUser.updatedAt = user.getUpdatedAt();
  }
}
