export class Permission {
  private constructor(
    private readonly id: string,
    private readonly resource: string,
    private readonly action: string,
    private readonly createdAt: Date,
  ) {}

  public getId(): string {
    return this.id;
  }

  public getResource(): string {
    return this.resource;
  }

  public getAction(): string {
    return this.action;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
}
