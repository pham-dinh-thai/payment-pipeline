import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Id } from '../../../shared/domain/value-objects/id.value-object';
import { Quantity } from '../../../shared/domain/value-objects/quantity.value-object';
import { UnitCost } from '../../../shared/domain/value-objects/unit-cost.value-object';

const MAX_LOT_NUMBER_LENGTH = 50;

export type CreateGoodsReceiptLineProps = {
  lotNumber: string;
  productId: string;
  unitCost: string;
  quantity: number;
  expiresAt: Date;
};

export type FromPersistentGoodsReceiptLineProps = {
  id: string;
  lotNumber: string;
  productId: string;
  unitCost: string;
  quantity: number;
  expiresAt: Date;
  batchId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class GoodsReceiptLine {
  private constructor(
    private readonly id: Id,
    private readonly lotNumber: string,
    private readonly productId: string,
    private readonly unitCost: UnitCost,
    private readonly quantity: Quantity,
    private readonly expiresAt: Date,
    private batchId: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  public static create(props: CreateGoodsReceiptLineProps): GoodsReceiptLine {
    const now = new Date();

    return new GoodsReceiptLine(
      Id.generate(),
      GoodsReceiptLine.normalizeLotNumber(props.lotNumber),
      GoodsReceiptLine.normalizeProductId(props.productId),
      UnitCost.create(props.unitCost),
      GoodsReceiptLine.normalizeQuantity(props.quantity),
      GoodsReceiptLine.normalizeExpiresAt(props.expiresAt),
      null,
      now,
      now,
    );
  }

  public static fromPersistent(
    props: FromPersistentGoodsReceiptLineProps,
  ): GoodsReceiptLine {
    return new GoodsReceiptLine(
      Id.create(props.id),
      props.lotNumber,
      props.productId,
      UnitCost.create(props.unitCost),
      Quantity.create(props.quantity),
      props.expiresAt,
      props.batchId,
      props.createdAt,
      props.updatedAt,
    );
  }

  public attachBatch(batchId: string): void {
    if (this.batchId) {
      throw new ConflictException(
        `Line ${this.getId()} is already attached to batch ${this.batchId}`,
      );
    }

    this.batchId = batchId;
    this.updatedAt = new Date();
  }

  public getTotalCost(): string {
    return this.unitCost.getTotal(this.quantity.getValue());
  }

  public getId(): string {
    return this.id.getValue();
  }

  public getLotNumber(): string {
    return this.lotNumber;
  }

  public getProductId(): string {
    return this.productId;
  }

  public getUnitCost(): string {
    return this.unitCost.toString();
  }

  public getQuantity(): number {
    return this.quantity.getValue();
  }

  public getExpiresAt(): Date {
    return this.expiresAt;
  }

  public getBatchId(): string | null {
    return this.batchId;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private static normalizeLotNumber(raw: string): string {
    const lotNumber = raw?.trim();

    if (!lotNumber) {
      throw new UnprocessableEntityException('Lot number is required');
    }

    if (lotNumber.length > MAX_LOT_NUMBER_LENGTH) {
      throw new UnprocessableEntityException(
        `Lot number must have at most ${MAX_LOT_NUMBER_LENGTH} characters`,
      );
    }

    return lotNumber;
  }

  private static normalizeProductId(raw: string): string {
    const productId = raw?.trim();

    if (!productId) {
      throw new UnprocessableEntityException('Product id is required');
    }

    return productId;
  }

  private static normalizeQuantity(value: number): Quantity {
    const quantity = Quantity.create(value);

    if (quantity.isZero()) {
      throw new UnprocessableEntityException(
        'Goods receipt line quantity must be greater than 0',
      );
    }

    return quantity;
  }

  private static normalizeExpiresAt(value: Date): Date {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new UnprocessableEntityException('Expires at must be a valid date');
    }

    return value;
  }
}
