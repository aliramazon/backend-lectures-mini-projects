import { prisma } from "../prisma/index.js";
import { CustomError } from "../utils/custom-error.js";
import { teamMemberService } from "./team-member.service.js";

class ProjectService {
    create = async (input, adminId) => {
        const project = await prisma.project.create({
            data: {
                ...input,
                adminId: adminId,
            },
        });

        return project;
    };

    getOne = async (id, adminId) => {
        const project = await prisma.project.findUnique({
            where: {
                id: id,
            },
        });

        if (!project) {
            throw new CustomError("Project does not exist", 404);
        }

        if (project.adminId !== adminId) {
            throw new CustomError(
                "Forbidden: This project does not belong to you!",
                403
            );
        }

        return project;
    };

    update = async (id, adminId, update) => {
        await prisma.project.update({
            where: {
                id: id,
                adminId: adminId,
            },
            data: {
                ...update,
            },
        });
    };

    getAll = async (adminId) => {
        const projects = await prisma.project.findMany({
            where: {
                adminId: adminId,
            },
        });

        return projects;
    };

    changeStatus = async (id, adminId, status) => {
        await prisma.project.update({
            where: {
                id: id,
                adminId: adminId,
            },

            data: {
                status: status,
            },
        });
    };

    addContributor = async (adminId, projectId, teamMemberId) => {
        await this.verifyProjectAndAdminRelation(projectId, adminId);
        await teamMemberService.verifyTeamMemberAndAdminRelation(
            teamMemberId,
            adminId
        );
        await prisma.teamMemberProject.create({
            data: { projectId, teamMemberId },
        });
    };

    deactivateContributor = async (adminId, projectId, teamMemberId) => {
        await this.verifyProjectAndAdminRelation(projectId, adminId);
        await teamMemberService.verifyTeamMemberAndAdminRelation(
            teamMemberId,
            adminId
        );
        await prisma.teamMemberProject.updateMany({
            where: {
                projectId,
                teamMemberId,
            },
            data: {
                status: "INACTIVE",
            },
        });
    };

    verifyProjectAndAdminRelation = async (id, adminId) => {
        const project = await prisma.project.findUnique({
            where: {
                id,
                adminId,
            },
        });

        if (!project) {
            throw new CustomError(
                "Forbidden: Project does not belong to you or it does not exist",
                403
            );
        }
    };
}

export const projectService = new ProjectService();
