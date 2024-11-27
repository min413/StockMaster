import express from 'express';
import { authCtrl } from '../controllers/index.js';

const router = express.Router(); 

router
    .route('/')
    .get(authCtrl.checkSign);
router
    .route('/sign-in')
    .post(authCtrl.signIn);
router
    .route('/sign-up')
    .post(authCtrl.signUp);
router
    .route('/sign-out')
    .post(authCtrl.signOut);
router
    .route('/change-info')
    .put(authCtrl.changeInfo);
router
    .route('/change-portfolio')
    .put(authCtrl.changePortfolio);

export default router;
