export interface IGetUserByIdPort {
  execute(id: string): Promise<{ id: string; email: string } | null>;
}

export const GET_USER_BY_ID_PORT = 'IGetUserByIdPort';
