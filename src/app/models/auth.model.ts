export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  msg: string;
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    is_active: boolean;
    avatar: string | null;
    roles: {
      id: number;
      name: string;
    }[];
  };
}


export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface RegisterResponse {
  message: string
  user: {
    id: number
    username: string
    email: string
  }
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
}
