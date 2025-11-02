import type {
    Pool,
    PoolOptions,
    RowDataPacket,
    ResultSetHeader,
} from "mysql2/promise";
import mysql from "mysql2/promise";

declare global {
    // eslint-disable-next-line no-var
    var __mysqlPool: Pool | undefined;
}

function createPool(): Pool {
    const {
        MYSQL_HOST = "localhost",
        MYSQL_PORT = "3306",
        MYSQL_USER,
        MYSQL_PASSWORD,
        MYSQL_DATABASE,
    } = process.env;

    if (!MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE) {
        throw new Error(
            "Missing MySQL environment variables. Please check MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE."
        );
    }

    const poolOptions: PoolOptions = {
        host: MYSQL_HOST,
        port: Number(MYSQL_PORT),
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60000,
        queueLimit: 0,
        namedPlaceholders: true,
    };

    return mysql.createPool(poolOptions);
}

function getPool(): Pool {
    if (!global.__mysqlPool) {
        global.__mysqlPool = createPool();
    }

    return global.__mysqlPool;
}

export async function query<T extends RowDataPacket[]>(
    sql: string,
    params: Record<string, unknown> | unknown[] = []
): Promise<T> {
    const pool = getPool();
    const [rows] = await pool.query<T>(sql, params);
    return rows;
}

export async function execute(
    sql: string,
    params: Record<string, unknown> | unknown[] = []
): Promise<ResultSetHeader> {
    const pool = getPool();
    const [result] = await pool.execute<ResultSetHeader>(sql, params);
    return result;
}

export async function getConnection() {
    return getPool().getConnection();
}
