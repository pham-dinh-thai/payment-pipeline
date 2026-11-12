/**
 * Actor metadata captured from the incoming request and attached to events,
 * so consumers can rebuild an audit entry outside the original request scope.
 */
export type ActorHeaders = {
  actorId: string;
  actorType: string;
  actorLabel: string;
  userIp: string;
  userAgent: string;
};
