import prisma from '../_prisma/client.js';

export default class Users {
  // CREATE
  static async create({ input }) {
    const { id, email, firstName, lastName, profilePic } = input;

    return prisma.user.create({
      data: {
        id,
        email,
        firstName,
        lastName,
        profilePic: profilePic ?? 0,
      },
    });
  }

  // UPDATE
  static async update({ id, input }) {
    return prisma.user.update({
      where: { id },
      data: input,
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
    } catch (_e) {
      return false;
    }
  }

  static async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
    });
  }
}
