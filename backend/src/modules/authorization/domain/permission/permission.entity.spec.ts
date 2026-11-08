import { describe, expect, it } from '@jest/globals';
import { UnprocessableEntityException } from '@nestjs/common';
import { Permission } from './permission.entity';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('Permission', () => {
  describe('create', () => {
    it('creates a concrete permission with a generated id', () => {
      const permission = Permission.create({
        resource: 'orders',
        action: 'process',
      });

      expect(permission.getId()).toMatch(UUID_V4_REGEX);
      expect(permission.getResource()).toBe('orders');
      expect(permission.getAction()).toBe('process');
      expect(permission.getKey()).toBe('orders:process');
      expect(permission.isWildcard()).toBe(false);
    });

    it('allows the manage wildcard', () => {
      const permission = Permission.create({
        resource: 'orders',
        action: 'manage',
      });

      expect(permission.getKey()).toBe('orders:manage');
      expect(permission.isWildcard()).toBe(true);
    });

    it('rejects an unknown resource', () => {
      expect(() =>
        Permission.create({ resource: 'unknown' as never, action: 'read' }),
      ).toThrow(UnprocessableEntityException);
    });

    it('rejects an action outside the resource catalog', () => {
      expect(() =>
        Permission.create({ resource: 'orders', action: 'delete' as never }),
      ).toThrow(UnprocessableEntityException);
    });
  });

  describe('matches', () => {
    it('matches only its own action', () => {
      const permission = Permission.create({
        resource: 'orders',
        action: 'read',
      });

      expect(permission.matches('orders', 'read')).toBe(true);
      expect(permission.matches('orders', 'process')).toBe(false);
      expect(permission.matches('reports', 'read')).toBe(false);
    });

    it('lets manage match every action on the same resource', () => {
      const permission = Permission.create({
        resource: 'orders',
        action: 'manage',
      });

      expect(permission.matches('orders', 'read')).toBe(true);
      expect(permission.matches('orders', 'refund')).toBe(true);
      expect(permission.matches('reports', 'export')).toBe(false);
    });
  });

  it('restores a permission from persisted data', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');

    const permission = Permission.fromPersistent({
      id: 'd3d3d3d3-d3d3-4d3d-8d3d-d3d3d3d3d3d3',
      resource: 'reports',
      action: 'export',
      createdAt,
    });

    expect(permission.getKey()).toBe('reports:export');
    expect(permission.getCreatedAt()).toEqual(createdAt);
  });
});
