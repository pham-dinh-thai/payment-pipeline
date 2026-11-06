import { Id } from '../../../shared/domain/value-objects/id.value-object';
import { Password } from './password.value-object';

export type CreateAccountProps = {
  userId: string;
  password: string;
};

export class Account {
  private constructor(
    private readonly id: Id,
    private readonly userId: string,
    private password: Password,
    private isActive: boolean,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  public static async create(props: CreateAccountProps): Promise<Account> {
    const now = new Date();

    return new Account(
      Id.generate(),
      props.userId,
      await Password.fromPlainText(props.password),
      true,
      now,
      now,
    );
  }

  public getId(): string {
    return this.id.getValue();
  }

  public getUserId(): string {
    return this.userId;
  }

  public getPassword(): string {
    return this.password.getValue();
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
