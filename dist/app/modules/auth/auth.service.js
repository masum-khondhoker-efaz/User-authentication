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
exports.AuthServices = void 0;
const bcrypt = __importStar(require("bcrypt"));
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const generateToken_1 = require("../../utils/generateToken");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const client_1 = require("@prisma/client");
const verifyToken_1 = require("../../utils/verifyToken");
const registerUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.email) {
        const existingUser = yield prisma_1.default.user.findUnique({
            where: {
                email: payload.email,
            },
        });
        if (existingUser) {
            throw new AppError_1.default(http_status_1.default.CONFLICT, 'User already exists!');
        }
    }
    const hashedPassword = yield bcrypt.hash(payload.password, 12);
    const userData = Object.assign(Object.assign({}, payload), { password: hashedPassword, role: client_1.UserRoleEnum.USER, status: client_1.UserStatus.ACTIVATE });
    const result = yield prisma_1.default.$transaction((transactionClient) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield transactionClient.user.create({
            data: userData,
        });
        if (!user) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User not created!');
        }
        const userWithOptionalPassword = user;
        delete userWithOptionalPassword.password;
        return user;
    }));
    return result;
});
const getMyProfileFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const Profile = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: id,
        },
        select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return Profile;
});
const loginUserFromDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            email: payload.email,
            status: client_1.UserStatus.ACTIVATE,
        },
    });
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    if (!userData.password) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password is missing for this user');
    }
    const isCorrectPassword = yield bcrypt.compare(payload.password, userData.password);
    if (!isCorrectPassword) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Password incorrect!');
    }
    const accessToken = yield (0, generateToken_1.generateToken)({
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
    }, config_1.default.jwt.access_secret, config_1.default.jwt.access_expires_in);
    const refreshedToken = yield (0, generateToken_1.refreshToken)({
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
    }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return {
        id: userData.id,
        name: userData.fullName,
        email: userData.email,
        role: userData.role,
        accessToken: accessToken,
        refreshToken: refreshedToken,
    };
});
const refreshTokenFromDB = (refreshedToken) => __awaiter(void 0, void 0, void 0, function* () {
    if (!generateToken_1.refreshToken) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Refresh token not found');
    }
    const decoded = yield (0, verifyToken_1.verifyToken)(refreshedToken, config_1.default.jwt.refresh_secret);
    const userData = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: decoded.id,
            status: client_1.UserStatus.ACTIVATE,
        },
    });
    if (!userData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found');
    }
    const newAccessToken = yield (0, generateToken_1.generateToken)({
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
    }, config_1.default.jwt.access_secret, config_1.default.jwt.access_expires_in);
    const newRefreshToken = yield (0, generateToken_1.refreshToken)({
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        role: userData.role,
    }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
});
// Exporting the services for use in controllers
exports.AuthServices = {
    registerUserIntoDB,
    getMyProfileFromDB,
    loginUserFromDB,
    refreshTokenFromDB,
};
