import {
  ConflictException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Id } from '../../../shared/value-objects/id.value-object';
import { GoodsReceiptStatus } from './goods-receipt-status.enum';
import { GoodsReceiptLine } from './goods-receipt-line.entity';
import { GoodsReceiptCode } from './value-objects/goods-receipt-code.value-object';

export type CreateGoodsReceiptProps = {
  sequence: number;
  supplierId: string;
  goodsReceiptLines: GoodsReceiptLine[];
  createdBy: string;
};

export type FromPersistentGoodsReceiptProps = {
  id: string;
  code: string;
  supplierId: string;
  goodsReceiptLines: GoodsReceiptLine[];
  status: GoodsReceiptStatus;
  createdBy: string;
  confirmedBy: string | null;
  confirmedAt: Date | null;
  cancelledBy: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class GoodsReceipt {
  private constructor(
    private readonly id: Id,
    private readonly code: GoodsReceiptCode,
    private readonly supplierId: string,
    private readonly goodsReceiptLines: GoodsReceiptLine[],
    private status: GoodsReceiptStatus,
    private readonly createdBy: string,
    private confirmedBy: string | null,
    private confirmedAt: Date | null,
    private cancelledBy: string | null,
    private cancelledAt: Date | null,
    private readonly createdAt: Date,
    private updatedAt: Date,
  ) {}

  public static create(props: CreateGoodsReceiptProps): GoodsReceipt {
    GoodsReceipt.assertHasLines(props.goodsReceiptLines);
    GoodsReceipt.assertNoDuplicateLines(props.goodsReceiptLines);

    const now = new Date();

    return new GoodsReceipt(
      Id.generate(),
      GoodsReceiptCode.fromNumber(props.sequence),
      props.supplierId,
      [...props.goodsReceiptLines],
      GoodsReceiptStatus.PENDING,
      props.createdBy,
      null,
      null,
      null,
      null,
      now,
      now,
    );
  }

  public static fromPersistent(
    props: FromPersistentGoodsReceiptProps,
  ): GoodsReceipt {
    return new GoodsReceipt(
      Id.create(props.id),
      GoodsReceiptCode.create(props.code),
      props.supplierId,
      [...props.goodsReceiptLines],
      props.status,
      props.createdBy,
      props.confirmedBy,
      props.confirmedAt,
      props.cancelledBy,
      props.cancelledAt,
      props.createdAt,
      props.updatedAt,
    );
  }

  public attachBatch(lineId: string, batchId: string): void {
    const line = this.goodsReceiptLines.find(
      (goodsReceiptLine) => goodsReceiptLine.getId() === lineId,
    );

    if (!line) {
      throw new NotFoundException(`Goods receipt line ${lineId} not found`);
    }

    line.attachBatch(batchId);
    this.updatedAt = new Date();
  }

  public confirm(by: string): void {
    if (this.status !== GoodsReceiptStatus.PENDING) {
      throw new ConflictException(
        'Only pending goods receipts can be confirmed',
      );
    }

    const now = new Date();

    this.status = GoodsReceiptStatus.CONFIRMED;
    this.confirmedBy = by;
    this.confirmedAt = now;
    this.updatedAt = now;
  }

  public cancel(by: string): void {
    if (this.status !== GoodsReceiptStatus.PENDING) {
      throw new ConflictException(
        'Only pending goods receipts can be cancelled',
      );
    }

    const now = new Date();

    this.status = GoodsReceiptStatus.CANCELLED;
    this.cancelledBy = by;
    this.cancelledAt = now;
    this.updatedAt = now;
  }

  public getId(): string {
    return this.id.getValue();
  }

  public getCode(): string {
    return this.code.getValue();
  }

  public getSupplierId(): string {
    return this.supplierId;
  }

  public getGoodsReceiptLines(): GoodsReceiptLine[] {
    return [...this.goodsReceiptLines];
  }

  public getStatus(): GoodsReceiptStatus {
    return this.status;
  }

  public getCreatedBy(): string {
    return this.createdBy;
  }

  public getConfirmedBy(): string | null {
    return this.confirmedBy;
  }

  public getConfirmedAt(): Date | null {
    return this.confirmedAt;
  }

  public getCancelledBy(): string | null {
    return this.cancelledBy;
  }

  public getCancelledAt(): Date | null {
    return this.cancelledAt;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  private static assertHasLines(lines: GoodsReceiptLine[]): void {
    if (lines.length === 0) {
      throw new UnprocessableEntityException(
        'Goods receipt must have at least one line',
      );
    }
  }

  private static assertNoDuplicateLines(lines: GoodsReceiptLine[]): void {
    const keys = new Set<string>();

    for (const line of lines) {
      const key = `${line.getProductId()}::${line.getLotNumber()}`;

      if (keys.has(key)) {
        throw new UnprocessableEntityException(
          `Duplicate line for product ${line.getProductId()} and lot "${line.getLotNumber()}"`,
        );
      }

      keys.add(key);
    }
  }
}
