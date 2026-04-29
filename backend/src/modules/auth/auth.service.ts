import bcrypt from "bcrypt";
import { UserRepository } from "../users/user.repository.js";
import { generateToken } from "../../lib/jwt.js";
import type { RegisterDto, LoginDto } from "./dto.js";

export class AuthService {
  private userRepo = new UserRepository();
  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new Error("Email ya registrado");
    }
    const hashedPassoword = await bcrypt.hash(dto.password, 10);

    const user = await this.userRepo.create({
      email: dto.email,
      password: hashedPassoword,
      name: dto.name,
    });
    const token = generateToken({ userId: user.id, email: user.email });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.email,
      },
    };
  }
  async login(dto: LoginDto) {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new Error("Credenciales invalidas");
    }

    const isValid = await bcrypt.compare(dto.password, user.password);

    if (!isValid) {
      throw new Error("Credenciales invalidas");
    }

    const token = generateToken({ userId: user.id, email: user.email });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.email,
      },
    };
  }
}
