import prisma from '../_prisma/client.js';

export default class Activities {
  // CREATE
  static async create({ input }) {
    return prisma.activity.create({
      data: input,
    });
  }

  // READ
  static async find({ id }) {
    return prisma.activity.findUnique({
      where: { id },
    });
  }

  static async findMany({ ids }) {
    return prisma.activity.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  // UPDATE
  static async update({ id, input }) {
    try {
      return prisma.activity.update({
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
      await prisma.activity.delete({
        where: { id },
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
