import type { Role } from "../models/User";

declare global {
  namespace Express {
    interface UserPayload { id: string; role: Role; nome: string }
    interface Request { user?: UserPayload }
  }
}
export {}