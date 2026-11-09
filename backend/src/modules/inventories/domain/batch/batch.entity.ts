import { Id } from '../../../../shared/value-objects/id.value-object';
import { BatchStatus } from './batch-status.enum';
import { LotNumber } from './value-objects/lot-number.value-object';
import { StockQuantity } from './value-objects/stock-quantity.value-object';
import { UnitCost } from '../../../../shared/value-objects/unit-cost.value-object';

export type CreateBatchProps = {
  lotNumber: string;
  productId: string;
  quantity: number;
  unitCost: string;
  status: BatchStatus;
  expiresAt: Date;
  createdBy: string;
};

export type FromPersistentBatchProps = {
  id: string;
  lotNumber: string;
  productId: string;
  quantity: number;
  unitCost: string;
  status: BatchStatus;
  expiresAt: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Batch {
  private constructor(
    private readonly id: Id,
    private readonly lotNumber: LotNumber,
    private readonly productId: string,
    private quantity: StockQuantity,
    private readonly unitCost: UnitCost,
    private status: BatchStatus,
    private expiresAt: Date,
    private readonly createdBy: string,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  public static create(props: CreateBatchProps): Batch {
    const createdAt = new Date();

    return new Batch(
      Id.generate(),
      LotNumber.create(props.lotNumber),
      props.productId,
      StockQuantity.create(props.quantity),
      UnitCost.create(props.unitCost),
      props.status,
      props.expiresAt,
      props.createdBy,
      createdAt,
      createdAt,
    );
  }

  public static fromPersistent(props: FromPersistentBatchProps): Batch {
    return new Batch(
      Id.create(props.id),
      LotNumber.create(props.lotNumber),
      props.productId,
      StockQuantity.create(props.quantity),
      UnitCost.create(props.unitCost),
      props.status,
      props.expiresAt,
      props.createdBy,
      props.createdAt,
      props.updatedAt,
    );
  }

  public issue(quantity: number): void {
    StockQuantity.assertPositive(quantity, 'Issue quantity');

    this.quantity = this.quantity.decrease(quantity);

    this.updatedAt = new Date();
  }

  public reconcile(countedQuantity: number): void {
    this.quantity = StockQuantity.create(countedQuantity);

    this.updatedAt = new Date();
  }

  public getTotalCost(): string {
    return this.unitCost.getTotal(this.quantity.getValue());
  }

  public getId(): string {
    return this.id.getValue();
  }

  public getLotNumber(): string {
    return this.lotNumber.getValue();
  }

  public getProductId(): string {
    return this.productId;
  }

  public getQuantity(): number {
    return this.quantity.getValue();
  }

  public getUnitCost(): string {
    return this.unitCost.toString();
  }

  public getStatus(): BatchStatus {
    return this.status;
  }

  public getExpiresAt(): Date {
    return this.expiresAt;
  }

  public getCreatedBy(): string {
    return this.createdBy;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
