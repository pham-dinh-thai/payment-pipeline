import 'reflect-metadata';
import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateGoodsReceiptRequest } from './create-goods-receipt.request';

const SUPPLIER_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const PRODUCT_ID = '0ca741a6-ce41-4010-8148-f7b2a32aef1c';

const validPayload = (): Record<string, unknown> => ({
  supplierId: SUPPLIER_ID,
  lines: [
    {
      lotNumber: 'LOT-001',
      productId: PRODUCT_ID,
      quantity: 10,
      unitCost: '2.50',
      expiresAt: '2030-01-01T00:00:00.000Z',
    },
  ],
});

const validateRequest = async (payload: Record<string, unknown>) => {
  const instance = plainToInstance(CreateGoodsReceiptRequest, payload);
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  return { instance, errors };
};

describe('CreateGoodsReceiptRequest', () => {
  it('accepts a valid payload and converts expiresAt to a Date', async () => {
    const { instance, errors } = await validateRequest(validPayload());

    expect(errors).toHaveLength(0);
    expect(instance.lines[0].expiresAt).toBeInstanceOf(Date);
    expect(instance.lines[0].expiresAt.toISOString()).toBe(
      '2030-01-01T00:00:00.000Z',
    );
  });

  it('trims the lot number', async () => {
    const payload = validPayload();

    (payload.lines as Record<string, unknown>[])[0].lotNumber = '  LOT-001  ';

    const { instance, errors } = await validateRequest(payload);

    expect(errors).toHaveLength(0);
    expect(instance.lines[0].lotNumber).toBe('LOT-001');
  });

  it('rejects a receipt without lines', async () => {
    const { errors } = await validateRequest({
      supplierId: SUPPLIER_ID,
      lines: [],
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('lines');
  });

  it('rejects an invalid supplier id', async () => {
    const { errors } = await validateRequest({
      ...validPayload(),
      supplierId: 'not-a-uuid',
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('supplierId');
  });

  it.each([
    { field: 'productId', value: 'not-a-uuid' },
    { field: 'quantity', value: 0 },
    { field: 'quantity', value: 1.5 },
    { field: 'unitCost', value: 'not-a-decimal' },
    { field: 'expiresAt', value: 'not-a-date' },
    { field: 'lotNumber', value: '   ' },
  ])(
    'rejects an invalid line field $field = $value',
    async ({ field, value }) => {
      const payload = validPayload();

      (payload.lines as Record<string, unknown>[])[0][field] = value;

      const { errors } = await validateRequest(payload);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('lines');
    },
  );

  it('rejects an unknown field in a line', async () => {
    const payload = validPayload();

    (payload.lines as Record<string, unknown>[])[0].unknown = true;

    const { errors } = await validateRequest(payload);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('lines');
  });
});
