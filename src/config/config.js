import dotenv from "dotenv";
dotenv.config();

const configVariables = {
  mongoURL:process.env.MONGO_URL || "",
  PORT: Number(process.env.PORT) || 8080,
  JWT_SECRET: process.env.JWT_SECRET || "t@a#sK_m@n@g3m3nt",
};
export default configVariables;
