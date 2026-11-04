import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  EntityManager,
  ForeignKeyConstraintViolationException,
  LockMode,
  UniqueConstraintViolationException,
} from '@mikro-orm/core';
import {
  FindGoodsReceiptOptions,
  IGoodsReceiptsRepository,
} from '../../domain/goods-receipts.repository';
import { GoodsReceipt } from '../../domain/goods-receipt.aggregate';
import { MikroGoodsReceipt } from '../entities/mikro-goods-receipt.entity';
import { MikroGoodsReceiptLine } from '../entities/mikro-goods-receipt-line.entity';
import { GoodsReceiptMapper } from '../mappers/goods-receipt.mapper';

@Injectable()
export class MikroGoodsReceiptsRepository implements IGoodsReceiptsRepository {
  public constructor(private readonly entityManager: EntityManager) {}

  public async nextSequence(): Promise<number> {
    const rows = (await this.entityManager
      .getConnection()
      .execute(`select nextval('goods_receipt_code_seq') as nextval`)) as {
      nextval: string;
    }[];

    return Number(rows[0].nextval);
  }

  public async findById(
    id: string,
    options: FindGoodsReceiptOptions = {},
  ): Promise<GoodsReceipt | null> {
    const lockMode = options.forUpdate ? LockMode.PESSIMISTIC_WRITE : undefined;

    const mikroGoodsReceipt = await this.entityManager.findOne(
      MikroGoodsReceipt,
      { id },
      { lockMode },
    );

    if (!mikroGoodsReceipt) {
      return null;
    }

    const mikroLines = await this.entityManager.find(
      MikroGoodsReceiptLine,
      { goodsReceiptId: id },
      {
        orderBy: { createdAt: 'asc', id: 'asc' },
        lockMode,
      },
    );

    return GoodsReceiptMapper.toDomain(mikroGoodsReceipt, mikroLines);
  }

  public async create(goodsReceipt: GoodsReceipt): Promise<GoodsReceipt> {
    try {
      const { goodsReceipt: mikroGoodsReceipt, lines } =
        GoodsReceiptMapper.toMikro(goodsReceipt);

      this.entityManager.persist(mikroGoodsReceipt);
      await this.entityManager.flush();

      this.entityManager.persist(lines);
      await this.entityManager.flush();

      return GoodsReceiptMapper.toDomain(mikroGoodsReceipt, lines);
    } catch (e) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException('Goods receipt code already exists');
      }

      if (e instanceof ForeignKeyConstraintViolationException) {
        throw new NotFoundException('Supplier or product not found');
      }

      throw e;
    }
  }

  public async update(goodsReceipt: GoodsReceipt): Promise<GoodsReceipt> {
    try {
      const mikroGoodsReceipt = this.entityManager.getReference(
        MikroGoodsReceipt,
        goodsReceipt.getId(),
      );

      mikroGoodsReceipt.status = goodsReceipt.getStatus();
      mikroGoodsReceipt.confirmedBy = goodsReceipt.getConfirmedBy();
      mikroGoodsReceipt.confirmedAt = goodsReceipt.getConfirmedAt();
      mikroGoodsReceipt.cancelledBy = goodsReceipt.getCancelledBy();
      mikroGoodsReceipt.cancelledAt = goodsReceipt.getCancelledAt();
      mikroGoodsReceipt.updatedAt = goodsReceipt.getUpdatedAt();

      for (const line of goodsReceipt.getGoodsReceiptLines()) {
        const mikroLine = this.entityManager.getReference(
          MikroGoodsReceiptLine,
          line.getId(),
        );

        mikroLine.batchId = line.getBatchId();
        mikroLine.updatedAt = line.getUpdatedAt();
      }

      await this.entityManager.flush();

      return goodsReceipt;
    } catch (e) {
      if (e instanceof ForeignKeyConstraintViolationException) {
        throw new NotFoundException('Batch not found');
      }

      throw e;
    }
  }
}
