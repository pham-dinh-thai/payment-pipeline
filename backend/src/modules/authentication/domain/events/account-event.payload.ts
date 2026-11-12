import { type ActorHeaders } from '../../../../shared/types/actor-headers';
import { Account } from '../account.aggregate';

export type AccountEventPayload = {
  headers: ActorHeaders;
  account: {
    id: string;
    userId: string;
  };
};

export const accountEventPayload = (
  account: Account,
  headers: ActorHeaders,
): AccountEventPayload => ({
  headers,
  account: {
    id: account.getId(),
    userId: account.getUserId(),
  },
});
