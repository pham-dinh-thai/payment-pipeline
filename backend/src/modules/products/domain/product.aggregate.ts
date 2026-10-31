import { Id } from '../../../shared/domain/value-objects/id.value-object';
import { Quantity } from './value-objects/quantity.value-object';
import { UnitPrice } from './value-objects/unit-price.object-value';

export type CreateProductProps = {
  name: string;
  unitPrice: string;
  quantity: number;
};

export type FromPersistentProductProps = {
  id: string;
  name: string;
  unitPrice: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};

export class Product {
  public constructor(
    private readonly id: Id,
    private name: string,
    private unitPrice: UnitPrice,
    private quantity: Quantity,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  public static create(props: CreateProductProps): Product {
    const createdAt = new Date();

    return new Product(
      Id.generate(),
      props.name,
      UnitPrice.create(props.unitPrice),
      Quantity.create(props.quantity),
      createdAt,
      createdAt,
    );
  }

  public static fromPersistent(props: FromPersistentProductProps): Product {
    return new Product(
      Id.create(props.id),
      props.name,
      UnitPrice.create(props.unitPrice),
      Quantity.create(props.quantity),
      props.createdAt,
      props.updatedAt,
    );
  }

  public updateName(newName: string): void {
    this.name = newName;

    this.updatedAt = new Date();
  }

  public updateUnitPrice(newUnitPrice: string): void {
    this.unitPrice = UnitPrice.create(newUnitPrice);

    this.updatedAt = new Date();
  }

  public updateQuantity(newQuantity: number): void {
    this.quantity = Quantity.create(newQuantity);

    this.updatedAt = new Date();
  }

  public getId(): string {
    return this.id.getValue();
  }

  public getName(): string {
    return this.name;
  }

  public getUnitPrice(): string {
    return this.unitPrice.toString();
  }

  public getQuantity(): number {
    return this.quantity.getValue();
  }

  public getCreatedAt(): Date {
    return new Date(this.createdAt);
  }

  public getUpdatedAt(): Date {
    return new Date(this.updatedAt);
  }
}
