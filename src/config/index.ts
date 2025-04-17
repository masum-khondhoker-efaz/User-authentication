import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  super_admin_password: process.env.SUPER_ADMIN_PASSWORD,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET,
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
  request_number_of_limit: process.env.REQUEST_NUMBER,
  request_time_limit: process.env.REQUEST_TIMEOUT,
  json_size_limit: process.env.MAX_JSON_SIZE,
  url_encoded_limit: process.env.URL_ENCODE,
};
