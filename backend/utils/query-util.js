import { pool } from '../config/db.js';

export const insertQuery = async (table, obj) => {
    try {
        let find_column = await pool.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME=? AND TABLE_SCHEMA=?`, [table, process.env.DB_DATABASE]);
        find_column = find_column?.result;
        find_column = find_column.map((column) => {
            return column?.COLUMN_NAME
        })
        let keys = Object.keys(obj);
        if (keys.length == 0) {
            return false;
        }
        let question_list = keys.map(key => {
            return '?'
        });
        let values = keys.map(key => {
            return obj[key]
        });

        let result = await pool.query(`INSERT INTO ${table} (${keys.join()}) VALUES (${question_list.join()})`, values);
        if (find_column.includes('sort_idx')) {
            let setting_sort_idx = await pool.query(`UPDATE ${table} SET sort_idx=? WHERE id=?`, [
                result?.result?.insertId,
                result?.result?.insertId,
            ])
        }
        return result;
    } catch (err) {
        return false;
    }
}

export const deleteQuery = async (table, where_obj, delete_true) => {
    let keys = Object.keys(where_obj);
    let where_list = [];
    for (var i = 0; i < keys.length; i++) {
        where_list.push(` ${keys[i]}=${where_obj[keys[i]]} `);
    }
    if (where_list.length == 0) {
        return true;
    }
    let sql = `UPDATE ${table} SET is_delete=1 WHERE ${where_list.join('AND')} `;
    if (delete_true) {
        sql = `DELETE FROM ${table} WHERE ${where_list.join('AND')}`
    }
    let result = await pool.query(sql);
    return result;
}
export const updateQuery = async (table, obj, id) => {
    let keys = Object.keys(obj);
    if (keys.length == 0) {
        return false;
    }
    let question_list = keys.map(key => {
        return `${key}=?`
    });
    let values = keys.map(key => {
        return obj[key]
    });
    let result = await pool.query(`UPDATE ${table} SET ${question_list.join()} WHERE id=${id}`, values);

    return result;
}
export const selectQuerySimple = async (table, id) => {
    let result = await pool.query(`SELECT * FROM ${table} WHERE id=${id}`);
    return result;
}
export const getTableNameBySelectQuery = (sql) => {// select query 가지고 불러올 메인 table명 불러오기 select * from user as asd
    let sql_split_list = sql.split(' FROM ')[1].split(' ');
    let table = '';
    for (var i = 0; i < sql_split_list.length; i++) {
        if (sql_split_list[i]) {
            table = sql_split_list[i];
            break;
        }
    }
    return table;
}