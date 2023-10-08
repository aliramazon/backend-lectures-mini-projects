import { prisma } from "../prisma/index.js";
import { hasher, crypto } from "../utils/hash.js";
import { mailer } from "../utils/mailer.js";
import { date } from "../utils/date.js";

class UserService {
    signUp = async (input) => {
        try {
            const hashedPassword = await hasher.hash(input.password);
            const activationToken = crypto.createToken();
            const hashedActivationToken = crypto.hash(activationToken);
            await prisma.user.create({
                data: {
                    ...input,
                    password: hashedPassword,
                    activationToken: hashedActivationToken,
                },
            });
            await mailer.sendActivationMail(input.email, activationToken);
        } catch (error) {
            throw new Error(error);
        }
    };

    login = async (input) => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    email: input.email,
                },
                select: {
                    id: true,
                    status: true,
                    password: true,
                },
            });

            if (!user) throw new Error("Invalid Credentials");

            if (user.status === "INACTIVE") {
                const activationToken = crypto.createToken();
                const hashedActivationToken = crypto.hash(activationToken);

                await prisma.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        activationToken: hashedActivationToken,
                    },
                });

                await mailer.sendActivationMail(input.email, activationToken);

                throw new Error(
                    "We just sent you activation email. Follow instructions"
                );
            }

            const isPasswordMatchs = await hasher.compare(
                input.password,
                user.password
            );
            if (!isPasswordMatchs) {
                throw new Error("Invalid Credentials");
            }
        } catch (error) {
            throw error;
        }
    };

    activate = async (token) => {
        try {
            const hashedActivationToken = crypto.hash(token);
            const user = await prisma.user.findFirst({
                where: {
                    activationToken: hashedActivationToken,
                },
                select: {
                    id: true,
                    activationToken: true,
                },
            });

            if (!user) {
                throw new Error("User was not found with provided token");
            }

            const isTokenMatchs = crypto.compare(token, user.activationToken);

            if (!isTokenMatchs) {
                throw new Error("Invalid Token");
            }

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    status: "ACTIVE",
                    activationToken: "",
                },
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    };

    forgotPassword = async (email) => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    email,
                },
                select: {
                    id: true,
                },
            });

            if (!user) {
                throw new Error(
                    "We could not find a user with the email you provided"
                );
            }

            const passwordResetToken = crypto.createToken();
            const hashedPasswordResetToken = crypto.hash(passwordResetToken);

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    passwordResetToken: hashedPasswordResetToken,
                    passwordResetTokenExpirationDate: date.addMinutes(10),
                },
            });

            await mailer.sendPasswordResetToken(email, passwordResetToken);
        } catch (error) {
            throw error;
        }
    };

    resetPassword = async (token, password) => {
        try {
            const hashedPasswordResetToken = crypto.hash(token);
            const user = await prisma.user.findFirst({
                where: {
                    passwordResetToken: hashedPasswordResetToken,
                },
                select: {
                    id: true,
                    passwordResetToken: true,
                    passwordResetTokenExpirationDate: true,
                },
            });

            if (!user) {
                throw new Error("User was not found with provided token");
            }

            const currentTime = new Date();
            const tokenExpDate = new Date(
                user.passwordResetTokenExpirationDate
            );

            if (tokenExpDate < currentTime) {
                // Token Expired;
                throw new Error("Reset Token Expired");
            }

            const isTokenMatchs = crypto.compare(
                token,
                hashedPasswordResetToken
            );
            if (!isTokenMatchs) {
                throw new Error("Invalid Reset Token");
            }

            await prisma.user.update({
                where: {
                    id: user.id,
                },
                data: {
                    password: await hasher.hash(password),
                    passwordResetToken: "",
                    passwordResetTokenExpirationDate: null,
                },
            });
        } catch (error) {
            throw error;
        }
    };
}

export const userService = new UserService();
