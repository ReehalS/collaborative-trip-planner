import prisma from '../_prisma/client.js';

export default class Trips {
  // CREATE
  static async create({ input }) {
    return prisma.trip.create({
      data: input,
    });
  }

  // READ
  static async find({ id }) {
    return prisma.trip.findUnique({
      where: { id },
    });
  }

  static async findMany({ ids }) {
    return prisma.trip.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  // UPDATE
  static async update({ id, input }) {
    try {
      return prisma.trip.update({
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
      await prisma.trip.delete({
        where: { id },
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
