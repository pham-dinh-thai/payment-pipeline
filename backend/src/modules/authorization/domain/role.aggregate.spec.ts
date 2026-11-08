import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  ConflictException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PermissionKey } from './permission/permission-catalog';
import { Role } from './role.aggregate';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const createRole = (): Role => Role.create({ name: 'manager' });

describe('Role', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a role with generated id and no permissions', () => {
    const role = createRole();

    expect(role.getId()).toMatch(UUID_V4_REGEX);
    expect(role.getName()).toBe('manager');
    expect(role.getPermissions()).toEqual([]);
    expect(role.getIsSuperAdmin()).toBe(false);
    expect(role.getCreatedAt()).toEqual(role.getUpdatedAt());
  });

  it('trims the name and rejects invalid names', () => {
    expect(Role.create({ name: '  manager  ' }).getName()).toBe('manager');

    expect(() => Role.create({ name: '   ' })).toThrow(
      UnprocessableEntityException,
    );
    expect(() => Role.create({ name: 'a'.repeat(51) })).toThrow(
      UnprocessableEntityException,
    );
  });

  it('grants a permission and exposes it through hasPermission', () => {
    const role = createRole();

    role.grant('orders:process');

    expect(role.hasPermission('orders', 'process')).toBe(true);
    expect(role.hasPermission('orders', 'refund')).toBe(false);
    expect(role.getPermissions()).toEqual(['orders:process']);
  });

  it('rejects granting the same permission twice', () => {
    const role = createRole();

    role.grant('orders:process');

    expect(() => role.grant('orders:process')).toThrow(ConflictException);
  });

  it('rejects invalid permission keys', () => {
    const role = createRole();
    const invalid = 'orders:approve' as unknown as PermissionKey;

    expect(() => role.grant(invalid)).toThrow(UnprocessableEntityException);
    expect(() =>
      Role.create({ name: 'manager', permissions: [invalid] }),
    ).toThrow(UnprocessableEntityException);
  });

  it('rejects duplicate permissions on creation', () => {
    expect(() =>
      Role.create({
        name: 'manager',
        permissions: ['orders:read', 'orders:read'],
      }),
    ).toThrow(UnprocessableEntityException);
  });

  it('lets a manage permission cover every action on its resource', () => {
    const role = Role.create({
      name: 'manager',
      permissions: ['orders:manage'],
    });

    expect(role.hasPermission('orders', 'process')).toBe(true);
    expect(role.hasPermission('orders', 'refund')).toBe(true);
    expect(role.hasPermission('reports', 'export')).toBe(false);
  });

  it('lets a super admin do anything', () => {
    const role = Role.create({ name: 'admin', isSuperAdmin: true });

    expect(role.hasPermission('orders', 'refund')).toBe(true);
    expect(role.hasPermission('reports', 'export')).toBe(true);
  });

  it('revokes a permission and rejects revoking an absent one', () => {
    const role = createRole();

    role.grant('orders:read');
    role.revoke('orders:read');

    expect(role.hasPermission('orders', 'read')).toBe(false);
    expect(() => role.revoke('orders:read')).toThrow(ConflictException);
  });

  it('updates name and updatedAt on rename', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const role = createRole();
    const updatedAt = role.getUpdatedAt();

    jest.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
    role.rename('admin');

    expect(role.getName()).toBe('admin');
    expect(role.getUpdatedAt().getTime()).toBeGreaterThan(updatedAt.getTime());
  });

  it('toggles the super admin flag', () => {
    const role = createRole();

    role.promoteToSuperAdmin();
    expect(role.getIsSuperAdmin()).toBe(true);

    role.demoteFromSuperAdmin();
    expect(role.getIsSuperAdmin()).toBe(false);
  });

  it('restores a role from persisted data', () => {
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const updatedAt = new Date('2026-01-02T00:00:00.000Z');

    const role = Role.fromPersistent({
      id: 'd3d3d3d3-d3d3-4d3d-8d3d-d3d3d3d3d3d3',
      name: 'admin',
      permissions: ['reports:export'],
      isSuperAdmin: true,
      createdAt,
      updatedAt,
    });

    expect(role.getName()).toBe('admin');
    expect(role.getIsSuperAdmin()).toBe(true);
    expect(role.hasPermission('reports', 'export')).toBe(true);
    expect(role.getCreatedAt()).toEqual(createdAt);
    expect(role.getUpdatedAt()).toEqual(updatedAt);
  });
});
