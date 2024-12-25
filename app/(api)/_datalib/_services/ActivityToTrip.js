import prisma from '../_prisma/client.js';

export default class ActivityToTrip {
  // CREATE
  static async create({ input }) {
    return prisma.activityToTrip.create({
      data: input,
      include: {
        activity: true,
        trip: true,
      },
    });
  }

  // READ
  static async find({ id }) {
    return prisma.activityToTrip.findUnique({
      where: { id },
      include: {
        activity: true,
        trip: true,
      },
    });
  }

  static async findMany({ ids }) {
    return prisma.activityToTrip.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        activity: true,
        trip: true,
      },
    });
  }

  static async findByTrip({ tripId }) {
    return prisma.activityToTrip.findMany({
      where: { tripId },
      include: {
        activity: true,
        trip: true,
      },
    });
  }

  // UPDATE
  static async update({ id, input }) {
    try {
      return prisma.activityToTrip.update({
        where: { id },
        data: input,
        include: {
          activity: true,
          trip: true,
        },
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
