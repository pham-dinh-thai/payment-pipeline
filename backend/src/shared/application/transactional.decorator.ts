import { IUnitOfWork } from './unit-of-work';

type UnitOfWorkHolder = {
  unitOfWork: IUnitOfWork;
};

/**
 * Bọc method trong một transaction thông qua IUnitOfWork.
 *
 * Class sử dụng phải inject IUnitOfWork vào property `unitOfWork`:
 * `@Inject(UNIT_OF_WORK) private readonly unitOfWork: IUnitOfWork`.
 *
 * Application layer chỉ phụ thuộc port IUnitOfWork, không biết ORM/DB.
 */
export function Transactional(): (
  target: object,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor,
) => void {
  return (_target, _propertyKey, descriptor) => {
    const original = descriptor.value as (
      this: UnitOfWorkHolder,
      ...args: unknown[]
    ) => Promise<unknown>;

    descriptor.value = function (
      this: UnitOfWorkHolder,
      ...args: unknown[]
    ): Promise<unknown> {
      if (!this.unitOfWork) {
        throw new Error(
          '@Transactional() requires an IUnitOfWork injected as `unitOfWork`',
        );
      }

      return this.unitOfWork.run(
        () => original.apply(this, args) as Promise<unknown>,
      );
    };
  };
}
