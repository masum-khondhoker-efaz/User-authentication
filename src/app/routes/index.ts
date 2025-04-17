import express from 'express';
import { AuthRouters } from '../modules/auth/auth.routes';
const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRouters,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
