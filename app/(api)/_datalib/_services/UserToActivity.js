import prisma from '../_prisma/client.js';

export default class UserToActivity {
  // CREATE
  static async create({ input }) {
    return prisma.userToActivity.create({
      data: input,
    });
  }

  // READ
  static async find({ id }) {
    return prisma.userToActivity.findUnique({
      where: { id },
    });
  }

  static async findMany({ ids }) {
    return prisma.userToActivity.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  // UPDATE
  static async update({ id, input }) {
    try {
      return prisma.userToActivity.update({
        where: { id },
        data: input,
      });
    } catch (e) {
      return null;
    }
  }

  // DELETE
  static async delete({ id }) {
    try {
      await prisma.userToActivity.delete({
        where: { id },
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
