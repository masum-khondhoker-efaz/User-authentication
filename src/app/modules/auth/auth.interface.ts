export interface IUserLoginRequest {
  email: string;
  password: string;
}

export interface IUserFilterRequest {
  fullName: string;
  email: string;
  password: string;
  role?: string
}
