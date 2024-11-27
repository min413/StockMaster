import crypto from 'crypto';
import util from 'util';
import { pool } from "../config/db.js";
import jwt from 'jsonwebtoken';
import { readSync } from 'fs';
import when from 'when';
import _ from 'lodash';

const randomBytesPromise = util.promisify(crypto.randomBytes);
const pbkdf2Promise = util.promisify(crypto.pbkdf2);

const createSalt = async () => {
    const buf = await randomBytesPromise(64);
    return buf.toString("base64");
};
export const createHashedPassword = async (password, salt_) => {
    let salt = salt_;
    if (!salt) {
        salt = await createSalt();
    }
    const key = await pbkdf2Promise(password, salt, 104906, 64, "sha512");
    const hashedPassword = key.toString("base64");
    return { hashedPassword, salt };
};
export const makeUserToken = (obj) => {
    let token = jwt.sign({ ...obj },
        'wjdrlaalsdlsckddnr',
        {
            expiresIn: '180m',
            issuer: 'fori',
        });
    return token
}
export const checkLevel = (token, level, res) => { // 유저 정보 뿌려주기
    try {
        if (token == undefined)
            return false

        const decoded = jwt.verify(token, 'wjdrlaalsdlsckddnr');
        const user_level = decoded?.level
        if (level > user_level)
            return false
        else
            return decoded
    }
    catch (err) {
        return false
    }
}
export const checkDns = (token) => { // dns 정보 뿌려주기
    try {
        if (token == undefined)
            return false

        const decoded = jwt.verify(token, 'wjdrlaalsdlsckddnr');

        if (decoded?.id)
            return decoded
        else
            return false
    }
    catch (err) {
        console.log(err)
        return false
    }
}

export const response = async (req, res, code, message, data) => { // 응답 포맷
    let resDict = {
        'result': code,
        'message': message,
        'data': data,
    }
    const decode_user = checkLevel(req.cookies.token, 0, res)
    const decode_dns = checkDns(req.cookies.dns, 0)
    if (req?.IS_RETURN) {
        return resDict;
    } else {
        if (code < 0) {
            res.status(500).send(resDict)
        } else {
            res.status(200).send(resDict)
        }
    }
}
export const lowLevelException = (req, res) => {
    return response(req, res, -150, "권한이 없습니다.", false);
}
