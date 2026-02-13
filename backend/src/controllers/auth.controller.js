import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/env.js';

export const signup = async (req, res, next) => {
    try {
        const { username, email, password, displayName } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user in a transaction
        const newUser = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    username,
                    email,
                    passwordHash: hashedPassword,
                    displayName: displayName || username,
                },
            });
            return user;
        });

        // Generate JWT token
        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        // Remove sensitive data before sending
        const { passwordHash, ...userWithoutPassword } = newUser;

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                token,
                user: userWithoutPassword,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            const error = new Error('Email not registered');
            error.statusCode = 404;
            throw error;
        }

        // Check if user has a password (might be Google OAuth only)
        if (!user.passwordHash) {
            const error = new Error('This account uses Google sign-in. Please login with Google.');
            error.statusCode = 400;
            throw error;
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            const error = new Error('Invalid password');
            error.statusCode = 401;
            throw error;
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        // Remove sensitive data
        const { passwordHash, ...userWithoutPassword } = user;

        res.status(200).json({
            success: true,
            message: 'Signed in successfully',
            data: {
                token,
                user: userWithoutPassword,
            },
        });
    } catch (error) {
        next(error);
    }
};

export const signout = async (req, res, next) => {
    try {
        // If session-based (Google OAuth), destroy session
        if (req.session) {
            req.logout(() => {
                req.session.destroy();
            });
        }

        // JWT is stateless — client just discards the token
        res.status(200).json({
            success: true,
            message: 'Signed out successfully',
        });
    } catch (error) {
        next(error);
    }
};