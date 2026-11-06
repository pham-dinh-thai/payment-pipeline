import { Id } from '../../../shared/domain/value-objects/id.value-object';

export type CreateAccountProps = {
  userId: string;
  password: string;
};

export class Account {
  private constructor(
    private readonly id: Id,
    private readonly userId: string,
    private password: string,
    private isActive: boolean,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  public static create(props: CreateAccountProps): Account {
    const now = new Date();

    return new Account(
      Id.generate(),
      props.userId,
      props.password,
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
    return this.password;
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
