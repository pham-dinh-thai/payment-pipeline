import { Batch } from '../../domain/batch/batch.entity';
import { MikroBatch } from '../entities/mikro-batch.entity';

export class BatchMapper {
  public static toDomain(mikroBatch: MikroBatch): Batch {
    return Batch.fromPersistent({
      id: mikroBatch.id,
      lotNumber: mikroBatch.lotNumber,
      productId: mikroBatch.productId,
      quantity: mikroBatch.quantity,
      unitCost: mikroBatch.unitCost.toString(),
      status: mikroBatch.status,
      expiresAt: new Date(mikroBatch.expiresAt),
      createdBy: mikroBatch.createdBy,
      createdAt: mikroBatch.createdAt,
      updatedAt: mikroBatch.updatedAt,
    });
  }

  public static toMikroOrm(batch: Batch): MikroBatch {
    const mikroBatch = new MikroBatch();

    mikroBatch.id = batch.getId();
    mikroBatch.lotNumber = batch.getLotNumber();
    mikroBatch.productId = batch.getProductId();
    mikroBatch.quantity = batch.getQuantity();
    mikroBatch.unitCost = BigInt(batch.getUnitCost());
    mikroBatch.status = batch.getStatus();
    mikroBatch.expiresAt = batch.getExpiresAt();
    mikroBatch.createdBy = batch.getCreatedBy();
    mikroBatch.createdAt = batch.getCreatedAt();
    mikroBatch.updatedAt = batch.getUpdatedAt();

    return mikroBatch;
  }
}
