export type CreateUserRequest = {
  firstName: string;
  lastName: string;
  email: string;
};

export interface ICreateUserPort {
  execute(request: CreateUserRequest): Promise<{ id: string }>;
}

export const CREATE_USER_PORT = 'ICreateUserPort';
