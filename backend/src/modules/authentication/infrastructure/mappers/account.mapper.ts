import { Account } from '../../domain/account.aggregate';
import { MikroAccount } from '../entities/mikro-account.entity';

export class AccountMapper {
  public static toMikroOrm(account: Account): MikroAccount {
    const mikroAccount = new MikroAccount();

    mikroAccount.id = account.getId();
    mikroAccount.userId = account.getUserId();
    mikroAccount.password = account.getPassword();
    mikroAccount.isActive = account.getIsActive();
    mikroAccount.createdAt = account.getCreatedAt();
    mikroAccount.updatedAt = account.getUpdatedAt();

    return mikroAccount;
  }
}
