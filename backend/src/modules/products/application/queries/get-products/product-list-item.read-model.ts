export class ProductListItemReadModel {
  public constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly unitPrice: string,
    public readonly quantity: number,
  ) {}
}
