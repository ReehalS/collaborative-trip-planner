import prisma from '../_prisma/client.js';

export default class UserToActivity {
  // CREATE
  static async create({ input }) {
    return prisma.userToActivity.create({
      data: input,
      include: {
        user: true,
        activity: true,
      },
    });
  }

  // READ
  static async find({ id }) {
    return prisma.userToActivity.findUnique({
      where: { id },
      include: {
        user: true,
        activity: true,
      },
    });
  }

  static async findMany({ ids }) {
    return prisma.userToActivity.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        user: true,
        activity: true,
      },
    });
  }

  static async findByUser(userId) {
    return prisma.userToActivity
      .findMany({
        where: { userId },
        include: {
          activity: true,
        },
      })
      .then((results) => results.map((uta) => uta.activity));
  }

  // UPDATE
  static async update({ id, input }) {
    try {
      return prisma.userToActivity.update({
        where: { id },
        data: input,
        include: {
          user: true,
          activity: true,
        },
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
