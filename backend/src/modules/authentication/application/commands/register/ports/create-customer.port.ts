export type CreateCustomerRequest = {
  userId: string;
};

export interface ICreateCustomerPort {
  execute(request: CreateCustomerRequest): Promise<{ id: string }>;
}

export const CREATE_CUSTOMER_PORT = 'ICreateCustomerPort';
