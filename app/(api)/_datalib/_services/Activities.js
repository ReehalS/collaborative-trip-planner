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

  // CAST VOTE
  static async castVote({ activityId, input }) {
    const { userId, score } = input;
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new Error('Activity not found');
    }

    const votes = activity.voters || [];

    const existingVoteIndex = votes.findIndex((vote) => vote.userId === userId);

    if (existingVoteIndex !== -1) {
      votes[existingVoteIndex].score = score;
    } else {
      votes.push({ userId, score });
    }

    const totalScore = votes.reduce((sum, vote) => sum + vote.score, 0);
    const avgScore = totalScore / votes.length;

    return prisma.activity.update({
      where: { id: activityId },
      data: {
        voters: votes,
        numVotes: votes.length,
        avgScore,
      },
    });
  }
}
