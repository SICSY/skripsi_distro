export {};

// Create a type for the roles
export type Roles = "ADMIN" | "USER";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}

export type FileModels = {
  id: number;
  name: string;
  model_url: string;
  uv_url: string;
};
