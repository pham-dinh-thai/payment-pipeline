import { Id } from '../../../shared/domain/value-objects/id.value-object';

export type FromPersistentCustomerProps = {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Customer {
  private constructor(
    private readonly id: Id,
    private readonly userId: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  public static create(userId: string): Customer {
    const now = new Date();

    return new Customer(Id.generate(), userId, now, now);
  }

  public static fromPersistent(props: FromPersistentCustomerProps): Customer {
    return new Customer(
      Id.create(props.id),
      props.userId,
      props.createdAt,
      props.updatedAt,
    );
  }

  public getId(): string {
    return this.id.getValue();
  }

  public getUserId(): string {
    return this.userId;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
