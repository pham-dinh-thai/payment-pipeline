import { describe, expect, it } from '@jest/globals';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateSupplierRequest } from './create-supplier.request';

const validateRequest = async (payload: Record<string, unknown>) => {
  const instance = plainToInstance(CreateSupplierRequest, payload);
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  return { instance, errors };
};

describe('CreateSupplierRequest', () => {
  it('accepts a valid payload and trims the name', async () => {
    const { instance, errors } = await validateRequest({
      name: '  Công ty TNHH ABC  ',
    });

    expect(errors).toHaveLength(0);
    expect(instance.name).toBe('Công ty TNHH ABC');
  });

  it('converts blank optional fields to null', async () => {
    const { instance, errors } = await validateRequest({
      name: 'Công ty TNHH ABC',
      phone: '   ',
      email: '',
      address: '',
      taxCode: '  ',
    });

    expect(errors).toHaveLength(0);
    expect(instance.phone).toBeNull();
    expect(instance.email).toBeNull();
    expect(instance.address).toBeNull();
    expect(instance.taxCode).toBeNull();
  });

  it.each([{}, { name: '' }, { name: '   ' }])(
    'rejects missing or blank name %p',
    async (payload) => {
      const { errors } = await validateRequest(payload);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    },
  );

  it('rejects a name longer than 255 characters', async () => {
    const { errors } = await validateRequest({ name: 'N'.repeat(256) });

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
  });

  it('rejects an invalid email', async () => {
    const { errors } = await validateRequest({
      name: 'Công ty TNHH ABC',
      email: 'not-an-email',
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
  });

  it('rejects unknown fields', async () => {
    const { errors } = await validateRequest({
      name: 'Công ty TNHH ABC',
      unknown: true,
    });

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('unknown');
  });

  it('does not validate Vietnamese phone prefixes at DTO level', async () => {
    const { instance, errors } = await validateRequest({
      name: 'Công ty TNHH ABC',
      phone: '123',
    });

    expect(errors).toHaveLength(0);
    expect(instance.phone).toBe('123');
  });
});
