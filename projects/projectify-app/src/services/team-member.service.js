import jwt from "jsonwebtoken";
import { prisma } from "../prisma/index.js";
import { crypto } from "../utils/crypto.js";
import { mailer } from "../utils/mailer.js";
import { CustomError } from "../utils/custom-error.js";
import { bcrypt } from "../utils/bcrypt.js";

class TeamMemberService {
    create = async (adminId, input) => {
        const inviteToken = crypto.createToken();
        const hashedInviteToken = crypto.hash(inviteToken);

        const teamMember = await prisma.teamMember.create({
            data: {
                ...input,
                adminId: adminId,
                inviteToken: hashedInviteToken,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                position: true,
                joinDate: true,
                email: true,
                status: true,
            },
        });

        await mailer.sendCreatePasswordInviteToTeamMember(
            input.email,
            inviteToken
        );

        return teamMember;
    };

    delete = async (adminId, teamMemberId) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id: teamMemberId,
            },
        });

        if (!teamMember) {
            throw new CustomError(
                `Team member does not exist with following id ${teamMemberId}`,
                404
            );
        }

        if (teamMember.adminId !== adminId) {
            throw new CustomError(
                "Forbidden: You are not authorized to perform this action",
                403
            );
        }

        if (
            teamMember.status === "ACTIVE" ||
            teamMember.status === "DEACTIVATED"
        ) {
            throw new CustomError(
                "Only users with INACTIVE status can be deleted!",
                404
            );
        }

        await prisma.teamMember.delete({
            where: {
                id: teamMemberId,
            },
        });
    };

    createPassword = async (inviteToken, password, email) => {
        const hashedInviteToken = crypto.hash(inviteToken);
        const hashedPassword = await bcrypt.hash(password);

        const teamMember = await prisma.teamMember.findFirst({
            where: {
                inviteToken: hashedInviteToken,
            },
        });

        if (!teamMember) {
            throw new CustomError("Invalid Token", 400);
        }

        await prisma.teamMember.update({
            where: {
                email: email,
            },

            data: {
                password: hashedPassword,
                status: "ACTIVE",
                inviteToken: null,
            },
        });
    };

    getAll = async (adminId) => {
        const teamMembers = await prisma.teamMember.findMany({
            where: {
                adminId: adminId,
            },

            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                position: true,
                status: true,
                joinDate: true,
            },
        });

        return teamMembers;
    };

    changeStatus = async (adminId, teamMemberId, status) => {
        const teamMember = await prisma.teamMember.findFirst({
            where: {
                id: teamMemberId,
            },
        });

        if (!teamMember) {
            throw new CustomError(
                `Team member does not exist with following id ${teamMemberId}`,
                404
            );
        }

        if (teamMember.adminId !== adminId) {
            throw new CustomError(
                "Forbidden: You are not authorized to perform this action",
                403
            );
        }

        if (teamMember.status === "INACTIVE") {
            throw new CustomError(
                "Status Change is now allowed. Users with INACTIVE status can be deleted only!",
                403
            );
        }

        await prisma.teamMember.update({
            where: {
                id: teamMemberId,
                adminId: adminId,
            },

            data: {
                status: status,
            },
        });
    };

    update = async (adminId, teamMemberId, updateData) => {
        await prisma.teamMember.update({
            where: {
                id: teamMemberId,
                adminId: adminId,
            },
            data: {
                ...updateData,
            },
        });
    };

    isTeamMemberBelongsToAdmin = async (id, adminId) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id,
            },
        });

        if (!teamMember) {
            throw new CustomError("Team member does not exist", 404);
        }

        if (teamMember.adminId !== adminId) {
            throw new CustomError(
                "Forbidden: You are not authorized to perform this action",
                403
            );
        }
    };

    login = async (email, password) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true,
                status: true,
                password: true,
                adminId: true,
                firstName: true,
                lastName: true,
            },
        });

        if (!teamMember)
            throw new CustomError("Team member does not exist", 404);

        if (teamMember.status === "INACTIVE") {
            const inviteToken = crypto.createToken();
            const hashedInviteToken = crypto.hash(inviteToken);

            await prisma.teamMember.update({
                where: {
                    email,
                },
                data: {
                    inviteToken: hashedInviteToken,
                },
            });
            await mailer.sendCreatePasswordInviteToTeamMember(
                email,
                inviteToken
            );

            throw new CustomError(
                "You did not set up the account password yet. We just emailed an instruction.",
                400
            );
        }

        if (teamMember.status === "DEACTIVATED") {
            throw new CustomError(
                "Oops. You do not have an access to the platform anymore!",
                401
            );
        }

        const isPasswordMatches = await bcrypt.compare(
            password,
            teamMember.password
        );

        if (!isPasswordMatches) {
            throw new CustomError("Invalid Credentials", 401);
        }

        const token = jwt.sign(
            {
                teamMember: {
                    id: teamMember.id,
                    adminId: teamMember.adminId,
                },
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2 days",
            }
        );

        return token;
    };

    getMe = async (id) => {
        const teamMember = await prisma.teamMember.findUnique({
            where: {
                id,
            },
            select: {
                firstName: true,
                lastName: true,
                position: true,
                status: true,
                email: true,
                id: true,
                adminId: true,
            },
        });

        if (!teamMember) {
            throw new CustomError("Team member does not exist", 404);
        }

        return { ...teamMember, role: "teamMember" };
    };
}

export const teamMemberService = new TeamMemberService();
