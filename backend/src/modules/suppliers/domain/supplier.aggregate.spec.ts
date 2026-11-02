import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { SupplierStatus } from './enums/supplier-status.enum';
import { Supplier } from './supplier.aggregate';

const SUPPLIER_ID = 'b3d7f2a8-7a0e-4f1c-9c1a-4d3f5e6a7b8c';
const CREATED_AT = new Date('2026-01-01T00:00:00.000Z');
const UPDATED_AT = new Date('2026-01-02T00:00:00.000Z');

const createSupplier = (): Supplier =>
  Supplier.create({
    code: 'NCC-001',
    name: 'Công ty TNHH ABC',
    phone: '0901234567',
    email: 'contact@abc.vn',
    address: '12 Nguyễn Huệ, Q1, TP.HCM',
    taxCode: '0312345678',
  });

const fromPersistent = (): Supplier =>
  Supplier.fromPersistent({
    id: SUPPLIER_ID,
    code: 'NCC-001',
    name: 'Công ty TNHH ABC',
    status: SupplierStatus.ACTIVE,
    phone: '0901234567',
    email: 'contact@abc.vn',
    address: '12 Nguyễn Huệ, Q1, TP.HCM',
    taxCode: '0312345678',
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
  });

describe('Supplier', () => {
  describe('create', () => {
    it('creates an active supplier with a generated uuid v4', () => {
      const supplier = createSupplier();

      expect(supplier.getId()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
      expect(supplier.getCode()).toBe('NCC-001');
      expect(supplier.getName()).toBe('Công ty TNHH ABC');
      expect(supplier.getStatus()).toBe(SupplierStatus.ACTIVE);
      expect(supplier.getPhone()).toBe('0901234567');
      expect(supplier.getEmail()).toBe('contact@abc.vn');
      expect(supplier.getAddress()).toBe('12 Nguyễn Huệ, Q1, TP.HCM');
      expect(supplier.getTaxCode()).toBe('0312345678');
      expect(supplier.getCreatedAt()).toEqual(supplier.getUpdatedAt());
    });

    it('trims required fields', () => {
      const supplier = Supplier.create({
        code: '  NCC-001  ',
        name: '  Công ty TNHH ABC  ',
      });

      expect(supplier.getCode()).toBe('NCC-001');
      expect(supplier.getName()).toBe('Công ty TNHH ABC');
    });

    it('normalizes omitted or blank optional fields to null', () => {
      const supplier = Supplier.create({
        code: 'NCC-001',
        name: 'Công ty TNHH ABC',
        phone: '   ',
        email: '',
        address: '   ',
        taxCode: '',
      });

      expect(supplier.getPhone()).toBeNull();
      expect(supplier.getEmail()).toBeNull();
      expect(supplier.getAddress()).toBeNull();
      expect(supplier.getTaxCode()).toBeNull();
    });

    it.each([
      { code: '   ', name: 'Công ty TNHH ABC' },
      { code: 'NCC-001', name: '   ' },
    ])('rejects invalid required fields %p', (props) => {
      expect(() => Supplier.create(props)).toThrow(
        UnprocessableEntityException,
      );
    });
  });

  describe('fromPersistent', () => {
    it('restores every field without regenerating the id', () => {
      const supplier = fromPersistent();

      expect(supplier.getId()).toBe(SUPPLIER_ID);
      expect(supplier.getCode()).toBe('NCC-001');
      expect(supplier.getName()).toBe('Công ty TNHH ABC');
      expect(supplier.getStatus()).toBe(SupplierStatus.ACTIVE);
      expect(supplier.getPhone()).toBe('0901234567');
      expect(supplier.getEmail()).toBe('contact@abc.vn');
      expect(supplier.getAddress()).toBe('12 Nguyễn Huệ, Q1, TP.HCM');
      expect(supplier.getTaxCode()).toBe('0312345678');
      expect(supplier.getCreatedAt()).toEqual(CREATED_AT);
      expect(supplier.getUpdatedAt()).toEqual(UPDATED_AT);
    });

    it('returns defensive copies of timestamps', () => {
      const supplier = fromPersistent();

      supplier.getCreatedAt().setFullYear(1999);

      expect(supplier.getCreatedAt()).toEqual(CREATED_AT);
    });

    it('rejects an invalid id', () => {
      expect(() =>
        Supplier.fromPersistent({
          id: 'not-a-uuid',
          code: 'NCC-001',
          name: 'Công ty TNHH ABC',
          status: SupplierStatus.ACTIVE,
          phone: null,
          email: null,
          address: null,
          taxCode: null,
          createdAt: CREATED_AT,
          updatedAt: UPDATED_AT,
        }),
      ).toThrow(UnprocessableEntityException);
    });
  });

  describe('status', () => {
    it('reports active state', () => {
      expect(fromPersistent().isActive()).toBe(true);
    });

    it('deactivates an active supplier and bumps updatedAt', () => {
      const supplier = fromPersistent();

      supplier.deactivate();

      expect(supplier.getStatus()).toBe(SupplierStatus.INACTIVE);
      expect(supplier.isActive()).toBe(false);
      expect(supplier.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(
        UPDATED_AT.getTime(),
      );
    });

    it('activates an inactive supplier', () => {
      const supplier = Supplier.fromPersistent({
        id: SUPPLIER_ID,
        code: 'NCC-001',
        name: 'Công ty TNHH ABC',
        status: SupplierStatus.INACTIVE,
        phone: null,
        email: null,
        address: null,
        taxCode: null,
        createdAt: CREATED_AT,
        updatedAt: UPDATED_AT,
      });

      supplier.activate();

      expect(supplier.getStatus()).toBe(SupplierStatus.ACTIVE);
      expect(supplier.isActive()).toBe(true);
    });
  });
});
