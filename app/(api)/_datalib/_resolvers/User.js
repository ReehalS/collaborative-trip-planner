import Users from '../_services/Users.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const resolvers = {
  Query: {
    user: (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Users.find({ id });
    },
    users: (_, { ids }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Users.findMany({ ids });
    },
  },
  Mutation: {
    createUser: (_, { input }) => {
      return Users.create({ input });
    },
    updateUser: async (_, { id, input }, { auth }) => {
      if (!auth?.userId || auth.userId !== id) {
        throw new Error('Unauthorized');
      }

      const updatedUser = await Users.update({ id, input });

      if (!updatedUser) {
        throw new Error('Failed to update user');
      }

      const tokenPayload = {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        profilePic: updatedUser.profilePic,
      };

      const newToken = jwt.sign(tokenPayload, process.env.NEXTAUTH_SECRET, {
        expiresIn: '30d',
      });

      return {
        user: updatedUser,
        token: newToken,
      };
    },
    deleteUser: (_, { id }, { auth }) => {
      if (!auth?.userId) throw new Error('Unauthorized');
      return Users.delete({ id });
    },
    forgotPassword: async (_, { email }, { auth }) => {
      const user = await Users.findByEmail(email);
      if (!user) {
        throw new Error('User with this email does not exist.');
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

      // Save token and expiration to the database
      await Users.update({
        id: user.id,
        input: {
          resetPasswordToken: resetToken,
          resetPasswordExpires,
        },
      });

      let frontendURL = process.env.FRONTEND_URL;
      if (process.env.NODE_ENV !== 'production') {
        frontendURL = 'http://localhost:3000';
      }

      // Send reset email
      const resetURL = `${frontendURL}/reset-password?token=${resetToken}`;

      const transporter = nodemailer.createTransport({
        service: 'Gmail',

        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: 'collaborativeplanner@gmail.com',
        to: email,
        subject: 'Password Reset Request- Collaborative Planner',
        html: `
          <p>You requested to reset your password. Click the link below to reset:</p>
          <a href="${resetURL}">Reset Password</a>
          <p>The link is valid for 1 hour</p>
          <p>If you didn't request this, you can ignore this email.</p>
        `,
      };

      await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      return {
        message: 'Reset password email sent successfully.',
      };
    },
    resetPassword: async (_, { token, newPassword }, { auth }) => {
      const user = await Users.findByResetToken(token);
      console.log(user);
      if (!user || user.resetPasswordExpires < new Date()) {
        throw new Error('Token is invalid or expired.');
      }

      // Update the user's password and clear the reset token
      const res = await Users.update({
        id: user.id,
        input: {
          password: newPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
      console.log(res);
      return {
        message: 'Password reset successfully.',
      };
    },
  },
};

export default resolvers;
