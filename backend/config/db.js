import mysql from "mysql";

const db = mysql.createConnection({
  host: 'localhost',
  password: '0123',
  user: 'root',
  database: 'capstone',
  timezone: 'asia/seoul',
  port: 3306,
  charset: 'utf8mb4',

})
db.connect();

export const pool = {
  query: (sql, list) => {
    return new Promise((resolve, reject) => {
      db.query(sql, list, (err, result, fields) => {
        if (err) {
          console.log(err)
          reject({
            code: -200,
            result: result
          })
        }
        else {
          resolve({
            code: 200,
            result: result
          })
        }
      })
    })
  }
}

export default db;