"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = __importStar(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const auth_service_1 = require("./auth.service");
const client_1 = require("@prisma/client");
const generateToken_1 = require("../../utils/generateToken");
// Mock the external dependencies
jest.mock('bcrypt');
jest.mock('../../utils/generateToken');
// Mock Prisma client
jest.mock('../../utils/prisma', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            findUniqueOrThrow: jest.fn(),
            create: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));
// Import the mocked Prisma after defining the mock
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
describe('AuthServices', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('registerUserIntoDB', () => {
        it('should register a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                id: '1',
                fullName: 'Test User',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'USER',
                status: client_1.UserStatus.ACTIVATE,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            prisma_1.default.user.findUnique.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedPassword');
            prisma_1.default.$transaction.mockImplementation((callback) => __awaiter(void 0, void 0, void 0, function* () {
                return callback({
                    user: {
                        create: jest.fn().mockResolvedValue(mockUser),
                    },
                });
            }));
            const result = yield auth_service_1.AuthServices.registerUserIntoDB({
                fullName: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'USER',
            });
            expect(prisma_1.default.user.findUnique).toHaveBeenCalledWith({
                where: { email: 'test@example.com' },
            });
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
            expect(result).toEqual(mockUser);
        }));
        it('should throw conflict error if user already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const existingUser = {
                id: '1',
                email: 'test@example.com',
            };
            prisma_1.default.user.findUnique.mockResolvedValue(existingUser);
            yield expect(auth_service_1.AuthServices.registerUserIntoDB({
                fullName: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'USER',
            })).rejects.toThrow(new AppError_1.default(http_status_1.default.CONFLICT, 'User already exists!'));
        }));
        it('should throw error if user creation fails', () => __awaiter(void 0, void 0, void 0, function* () {
            prisma_1.default.user.findUnique.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashedPassword');
            prisma_1.default.$transaction.mockImplementation((callback) => __awaiter(void 0, void 0, void 0, function* () {
                return callback({
                    user: {
                        create: jest.fn().mockResolvedValue(null),
                    },
                });
            }));
            yield expect(auth_service_1.AuthServices.registerUserIntoDB({
                fullName: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'USER',
            })).rejects.toThrow(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User not created!'));
        }));
    });
    describe('loginUserFromDB', () => {
        it('should login user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                id: '1',
                fullName: 'Test User',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'USER',
                status: client_1.UserStatus.ACTIVATE,
            };
            prisma_1.default.user.findUniqueOrThrow.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            generateToken_1.generateToken.mockResolvedValue('mockAccessToken');
            const result = yield auth_service_1.AuthServices.loginUserFromDB({
                email: 'test@example.com',
                password: 'password123',
            });
            expect(prisma_1.default.user.findUniqueOrThrow).toHaveBeenCalledWith({
                where: {
                    email: 'test@example.com',
                    status: client_1.UserStatus.ACTIVATE,
                },
            });
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(result).toEqual({
                id: '1',
                name: 'Test User',
                email: 'test@example.com',
                role: 'USER',
                accessToken: 'mockAccessToken',
            });
        }));
        it('should throw error if user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            prisma_1.default.user.findUniqueOrThrow.mockRejectedValue(new Error('User not found'));
            yield expect(auth_service_1.AuthServices.loginUserFromDB({
                email: 'nonexistent@example.com',
                password: 'password123',
            })).rejects.toThrow(new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found'));
        }));
        it('should throw error if password is missing', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                password: null,
            };
            prisma_1.default.user.findUniqueOrThrow.mockResolvedValue(mockUser);
            yield expect(auth_service_1.AuthServices.loginUserFromDB({
                email: 'test@example.com',
                password: 'password123',
            })).rejects.toThrow(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password is missing for this user'));
        }));
        it('should throw error if password is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                id: '1',
                email: 'test@example.com',
                password: 'hashedPassword',
            };
            prisma_1.default.user.findUniqueOrThrow.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);
            yield expect(auth_service_1.AuthServices.loginUserFromDB({
                email: 'test@example.com',
                password: 'wrongPassword',
            })).rejects.toThrow(new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password incorrect!'));
        }));
    });
    describe('getMyProfileFromDB', () => {
        it('should return user profile successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockProfile = {
                id: '1',
                fullName: 'Test User',
                email: 'test@example.com',
                role: 'USER',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            prisma_1.default.user.findUniqueOrThrow.mockResolvedValue(mockProfile);
            const result = yield auth_service_1.AuthServices.getMyProfileFromDB('1');
            expect(prisma_1.default.user.findUniqueOrThrow).toHaveBeenCalledWith({
                where: { id: '1' },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            expect(result).toEqual(mockProfile);
        }));
        it('should throw error if profile not found', () => __awaiter(void 0, void 0, void 0, function* () {
            prisma_1.default.user.findUniqueOrThrow.mockRejectedValue(new Error('Profile not found'));
            yield expect(auth_service_1.AuthServices.getMyProfileFromDB('nonexistent-id')).rejects.toThrow('Profile not found');
        }));
    });
});
