export interface Request {
  id: string;
  name: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: string;
  auth?: {
    type: string;
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiValue?: string;
  };
}

export interface Collection {
  id: string;
  name: string;
  requests: Request[];
}

export interface Environment {
  id: string;
  name: string;
  color: string;
  variables: Record<string, string | number | boolean>;
  baseUrl?: string;
  token?: string;
  apiKey?: string;
  // New property to store environment-specific URLs
  urls?: Record<string, string>;
}

export interface Response {
  status: number;
  time: number;
  size: number;
  headers: Record<string, string>;
  body: string;
}

export interface Difference {
  path: string;
  type: 'added' | 'removed' | 'changed';
  leftValue?: any;
  rightValue?: any;
}