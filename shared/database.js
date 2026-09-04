import mysqlx from '@mysql/xdevapi';
import dotenv from 'dotenv';

dotenv.config();

const options = {
  host: process.env.MYSQL_HOST || process.env.DB_HOST,
  port: process.env.MYSQL_PORT || 33060,
  user: process.env.MYSQL_USER || process.env.DB_USER,
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD,
  schema: process.env.MYSQL_DATABASE || process.env.DB_NAME,
  connectTimeout: 30000
};

const client = mysqlx.getClient(options, {
  pooling: {
    enabled: true,
    maxSize: 50,
    maxIdleTime: 50000,
    queueTimeout: 100000
  }
});

export const getApiSession = async () => {
  return await client.getSession();
};

export const dbClient = client;
