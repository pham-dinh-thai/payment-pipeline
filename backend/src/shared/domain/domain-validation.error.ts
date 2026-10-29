export class DomainValidationException extends Error {
  public constructor(message: string) {
    super(message);
    this.name = DomainValidationException.name;
  }
}
