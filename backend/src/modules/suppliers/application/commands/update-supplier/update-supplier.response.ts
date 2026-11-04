export class UpdateSupplierResponse {
  public constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly phone: string | null,
    public readonly email: string | null,
    public readonly address: string | null,
    public readonly taxCode: string | null,
  ) {}
}
