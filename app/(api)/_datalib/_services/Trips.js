import prisma from '../_prisma/client.js';

export default class Trips {
  // Helper function to generate random alphanumeric string
  static generateJoinCode(length = 10) {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // CREATE
  static async create({ input }) {
    const { userIds, joinCode, ...tripData } = input;

    // Generate a join code if it is not provided or invalid
    const validJoinCode =
      joinCode && joinCode.length >= 1 ? joinCode : Trips.generateJoinCode();

    // Create the trip
    const trip = await prisma.trip.create({
      data: {
        ...tripData,
        joinCode: validJoinCode,
      },
    });

    // Add the creator(s) to UserToTrip
    await Promise.all(
      userIds.map((userId) =>
        prisma.userToTrip.create({
          data: {
            userId,
            tripId: trip.id,
            role: 'CREATOR', // Assuming the creator role
          },
        })
      )
    );

    return trip;
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

  // DELETE
  static async delete({ id }) {
    try {
      // Delete related records from ActivityToTrip
      await prisma.activityToTrip.deleteMany({
        where: { tripId: id },
      });

      // Delete related records from UserToTrip
      await prisma.userToTrip.deleteMany({
        where: { tripId: id },
      });

      // Find all activities associated with this trip to remove UserToActivity records
      const activities = await prisma.activity.findMany({
        where: { tripId: id },
      });

      const activityIds = activities.map((activity) => activity.id);

      if (activityIds.length > 0) {
        // Delete related records from UserToActivity for these activities
        await prisma.userToActivity.deleteMany({
          where: { activityId: { in: activityIds } },
        });

        // Delete the activities themselves
        await prisma.activity.deleteMany({
          where: { id: { in: activityIds } },
        });
      }

      // Delete the trip itself
      await prisma.trip.delete({
        where: { id: id },
      });

      return true;
    } catch (e) {
      console.error('Failed to delete trip and related records:', e);
      return false;
    }
  }

  // VALIDATE JOIN CODE
  static async validateJoinCode(joinCode) {
    const existingTrip = await prisma.trip.findUnique({
      where: { joinCode },
    });
    return !existingTrip; // Returns true if joinCode is valid (not in use)
  }

  // CHECK CREATOR
  static async checkCreator({ tripId, userId }) {
    const userToTrip = await prisma.userToTrip.findFirst({
      where: { tripId, userId, role: 'CREATOR' },
    });
    return !!userToTrip; // Return true if the user is the creator
  }

  static async findByJoinCode({ joinCode }) {
    return prisma.trip.findUnique({
      where: { joinCode },
    });
  }
}
