export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface WithdrawRequest {
  currentPassword: string;
}
