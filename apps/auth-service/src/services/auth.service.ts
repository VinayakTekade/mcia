import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-mcia';

export class AuthService {
  private userRepo = new UserRepository();

  async register(data: Prisma.UserCreateInput) {
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw { status: 409, message: 'Email already in use' };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userRepo.create({ ...data, password: hashedPassword });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(email: string, pass: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const isValid = await bcrypt.compare(pass, user.password);
    if (!isValid) {
      throw { status: 401, message: 'Invalid email or password' };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async getProfile(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
