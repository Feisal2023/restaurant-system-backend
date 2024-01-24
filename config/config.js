import dotenv from "dotenv";
dotenv.config();
export const PORT = process.env.PORT;
export const dbURL = process.env.DATABASE_URL;
export const jwtSECRET = process.env.JWT_SECRET;
