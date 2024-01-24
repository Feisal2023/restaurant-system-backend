import dotenv from "dotenv";
dotenv.config();
export const PORT = process.env.PORT;
export const dbURL = process.env.DATABASE_URL;
export const jwtSECRET = process.env.JWT_SECRET;
export const frontendURL = process.env.FRONTEND_URL;
export const emailHOST = process.env.EMAIL_HOST;
export const emailUSER = process.env.EMAIL_USER;
export const emailPASS = process.env.EMAIL_PASS;
