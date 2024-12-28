import bcrypt from 'bcrypt';
import prisma from '../_prisma/client.js';

export default class Users {
  // CREATE
  static async create({ input }) {
    const { email, firstName, lastName, profilePic, password } = input;

    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    return prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        profilePic,
        password: hashedPassword,
      },
    });
  }

  // UPDATE
  static async update({ id, input }) {
    const { password, ...rest } = input;

    const data = { ...rest };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
    }

    return prisma.user.update({
      where: { id },
      data,
    });
  }

  // READ
  static async find({ id }) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async findMany({ ids }) {
    return prisma.user.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  // DELETE
  static async delete({ id }) {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  static async findByResetToken(resetPasswordToken) {
    return prisma.user.findUnique({
      where: { resetPasswordToken },
    });
  }
}
