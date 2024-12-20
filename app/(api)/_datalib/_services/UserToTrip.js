import prisma from '../_prisma/client.js';

export default class UserToTrip {
  // CREATE
  static async create({ input }) {
    return prisma.userToTrip.create({
      data: input,
    });
  }

  // READ
  static async find({ id }) {
    return prisma.userToTrip.findUnique({
      where: { id },
    });
  }

  static async findMany({ ids }) {
    return prisma.userToTrip.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  // UPDATE
  static async update({ id, input }) {
    try {
      return prisma.userToTrip.update({
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
      await prisma.userToTrip.delete({
        where: { id },
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
