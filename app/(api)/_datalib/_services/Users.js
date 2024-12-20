import prisma from '../_prisma/client.js';

export default class Users {
  // CREATE
  static async create({ input }) {
    return prisma.user.create({
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

  // UPDATE
  static async update({ id, input }) {
    try {
      return prisma.user.update({
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
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
