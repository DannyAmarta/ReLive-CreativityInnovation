import { Role } from "@prisma/client";

export type AuthJwtPayload = {
    sub: number;
    role: Role;
};