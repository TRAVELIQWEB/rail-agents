export interface AdminUserSchema {
  email: string;
  passwordHash: string;
  role: "admin";
  sessionVersion: number;
  updatedAt?: Date;
}

export const AdminUserSchemaDefinition = {
  email: { type: "string", required: true, unique: true },
  passwordHash: { type: "string", required: true },
  role: { type: "string", required: true, default: "admin" },
  sessionVersion: { type: "number", required: true, default: 1 },
} as const;
