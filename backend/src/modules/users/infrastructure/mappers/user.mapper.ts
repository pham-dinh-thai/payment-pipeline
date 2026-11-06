import { User } from '../../domain/user.aggregate';
import { MikroUser } from '../entities/mikro-user.entity';

export class UserMapper {
  public static toDomain(mikroUser: MikroUser): User {
    return User.fromPersistent({
      id: mikroUser.id,
      firstName: mikroUser.firstName,
      lastName: mikroUser.lastName,
      email: mikroUser.email,
      createdAt: mikroUser.createdAt,
      updatedAt: mikroUser.updatedAt,
    });
  }

  public static toMikroOrm(user: User): MikroUser {
    const mikroUser = new MikroUser();

    mikroUser.id = user.getId();
    mikroUser.firstName = user.getFirstName();
    mikroUser.lastName = user.getLastName();
    mikroUser.email = user.getEmail();
    mikroUser.createdAt = user.getCreatedAt();
    mikroUser.updatedAt = user.getUpdatedAt();

    return mikroUser;
  }
}
