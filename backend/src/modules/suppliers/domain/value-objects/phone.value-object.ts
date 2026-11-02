export class Phone {
  private constructor(private readonly value: string) {}

  public static create(number: string): Phone {
    return new Phone(number);
  }

  public getValue(): string {
    return this.value;
  }
}
