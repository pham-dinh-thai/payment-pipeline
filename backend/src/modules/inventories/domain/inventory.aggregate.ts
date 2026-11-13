import { NotFoundException } from '@nestjs/common';
import { BatchStatus } from './batch/batch-status.enum';
import { Batch } from './batch/batch.entity';

export type AddBatchProps = {
  id?: string;
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
  private readonly updatedBatches: Batch[] = [];

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
      id: props.id,
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

  public issueStock(batchId: string, quantity: number): number {
    const batch = this.findBatchById(batchId);

    batch.issue(quantity);

    this.updatedBatches.push(batch);

    return batch.getQuantity();
  }

  public reconcileStock(batchId: string, countedQuantity: number): number {
    const batch = this.findBatchById(batchId);

    batch.reconcile(countedQuantity);

    this.updatedBatches.push(batch);

    return batch.getQuantity();
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
    return [...this.updatedBatches];
  }

  private findBatchById(batchId: string): Batch {
    const batch = this.batches.find((b) => b.getId() === batchId);

    if (!batch) {
      throw new NotFoundException(`Batch id ${batchId} not found`);
    }

    return batch;
  }
}
