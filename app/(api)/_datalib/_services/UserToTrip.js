import prisma from '../_prisma/client.js';

export default class UserToTrip {
  // CREATE
  static async create({ tripId, userId, role }) {
    return prisma.userToTrip.create({
      data: {
        tripId,
        userId,
        role,
      },
    });
  }

  // READ
  static async find({ id }) {
    return prisma.userToTrip.findUnique({
      where: { id },
      include: {
        trip: true,
        user: true,
      },
    });
  }

  static async findMany({ userId, tripId }) {
    const whereClause = {};
    if (userId) whereClause.userId = userId;
    if (tripId) whereClause.tripId = tripId;

    return prisma.userToTrip.findMany({
      where: whereClause,
      include: {
        trip: true,
        user: true,
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

  static async findMembersByTrip({ tripId }) {
    return prisma.userToTrip.findMany({
      where: { tripId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }  
}
