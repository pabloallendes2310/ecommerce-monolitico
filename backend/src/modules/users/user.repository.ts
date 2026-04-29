import { User } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
export class UserRepository {
  async create(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<User> {
    return prisma.user.create({ data });
  }
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }
}
