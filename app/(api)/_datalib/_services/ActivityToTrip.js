import prisma from '../_prisma/client.js';

export default class ActivityToTrip {
  // CREATE
  static async create({ input }) {
    return prisma.activityToTrip.create({
      data: input,
    });
  }

  // READ
  static async find({ id }) {
    return prisma.activityToTrip.findUnique({
      where: { id },
    });
  }

  static async findMany({ ids }) {
    return prisma.activityToTrip.findMany({
      where: {
        id: { in: ids },
      },
    });
  }

  // UPDATE
  static async update({ id, input }) {
    try {
      return prisma.activityToTrip.update({
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
      await prisma.activityToTrip.delete({
        where: { id },
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
