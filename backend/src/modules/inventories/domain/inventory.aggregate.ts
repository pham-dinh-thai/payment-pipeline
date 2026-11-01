import { NotFoundException } from '@nestjs/common';
import { BatchStatus } from './batch/batch-status.enum';
import { Batch, FromPersistentBatchProps } from './batch/batch.entity';

export type AddBatchProps = {
  lotNumber: string;
  productId: string;
  quantity: number;
  unitCost: string;
  status: BatchStatus;
  expiresAt: Date;
  createdBy: string;
};

export class Inventory {
  private readonly newBatches: Batch[] = [];
  private readonly updatdedBatches: Batch[] = [];

  private constructor(
    private readonly productId: string,
    private batches: Batch[],
  ) {}

  public static create(productId: string): Inventory {
    return new Inventory(productId, []);
  }

  public static fromPersistent(productId: string, batches: Batch[]): Inventory {
    return new Inventory(productId, batches);
  }

  public addBatch(props: AddBatchProps): { batchId: string } {
    const batch = Batch.create({
      lotNumber: props.lotNumber,
      productId: props.productId,
      quantity: props.quantity,
      unitCost: props.unitCost,
      status: props.status,
      expiresAt: props.expiresAt,
      createdBy: props.createdBy,
    });

    this.newBatches.push(batch);
    this.batches.push(batch);

    return { batchId: batch.getId() };
  }

  public adjustStock(batchId: string, delta: number): void {
    const batch = this.findBatchById(batchId);

    batch.adjustStock(delta);

    this.updatdedBatches.push(batch);
  }

  public increaseStock(batchId: string, delta: number): void {
    const batch = this.findBatchById(batchId);

    batch.increaseStock(delta);

    this.updatdedBatches.push(batch);
  }

  public decreaseStock(batchId: string, delta: number): void {
    const batch = this.findBatchById(batchId);

    batch.decreaseStock(delta);

    this.updatdedBatches.push(batch);
  }

  public getProductId(): string {
    return this.productId;
  }

  public getBatches(): Batch[] {
    return [...this.batches];
  }

  public getNewBatches(): Batch[] {
    return [...this.newBatches];
  }

  public getUpdatedBatches(): Batch[] {
    return [...this.updatdedBatches];
  }

  private findBatchById(batchId: string): Batch {
    const batch = this.batches.find((b) => b.getId() === batchId);

    if (!batch) {
      throw new NotFoundException(`Batch id ${batchId} not found`);
    }

    return batch;
  }
}
