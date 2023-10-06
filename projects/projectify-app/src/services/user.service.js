import { prisma } from "../prisma/index.js";
import { hasher } from "../utils/hash.js";

class UserService {
    signUp = async (input) => {
        try {
            const hashedPassword = await hasher.hash(input.password);
            await prisma.user.create({
                data: { ...input, password: hashedPassword },
            });
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    };
}

export const userService = new UserService();
