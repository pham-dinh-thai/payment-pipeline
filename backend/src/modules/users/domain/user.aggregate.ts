import { Id } from '../../../shared/domain/value-objects/id.value-object';

export type CreateUserProps = {
  firstName: string;
  lastName: string;
  email: string;
};

export type FromPersistentUserProps = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export class User {
  public constructor(
    private readonly id: Id,
    private firstName: string,
    private lastName: string,
    private email: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  public static create(props: CreateUserProps): User {
    const now = new Date();
    return new User(
      Id.generate(),
      props.firstName,
      props.lastName,
      props.email,
      now,
      now,
    );
  }

  public static fromPersistent(props: FromPersistentUserProps): User {
    return new User(
      Id.create(props.id),
      props.firstName,
      props.lastName,
      props.email,
      props.createdAt,
      props.updatedAt,
    );
  }

  public changeEmail(email: string): void {
    this.email = email;

    this.updatedAt = new Date();
  }

  public getId(): string {
    return this.id.getValue();
  }

  public getFirstName(): string {
    return this.firstName;
  }

  public getLastName(): string {
    return this.lastName;
  }

  public getEmail(): string {
    return this.email;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
