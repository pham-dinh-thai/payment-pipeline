export interface IGetUserByEmailPort {
  execute(email: string): Promise<{ id: string; email: string } | null>;
}

export const GET_USER_BY_EMAIL_PORT = 'IGetUserByEmailPort';
