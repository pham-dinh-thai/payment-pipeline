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

  private constructor(
    private readonly productId: string,
    private batches: Batch[],
  ) {}

  public static create(productId: string): Inventory {
    return new Inventory(productId, []);
  }

  public static fromPersistent(
    productId: string,
    batches: FromPersistentBatchProps[],
  ): Inventory {
    return new Inventory(
      productId,
      batches.map((batch) => Batch.fromPersistent(batch)),
    );
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

  public getProductId(): string {
    return this.productId;
  }

  public getBatches(): Batch[] {
    return [...this.batches];
  }

  public getNewBatches(): Batch[] {
    return [...this.newBatches];
  }
}
