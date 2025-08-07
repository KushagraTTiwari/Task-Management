import bcrypt from "bcrypt";

export function generateHashPassword(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
}
 
export function validHashPassword(password, user_password) {
  const isPasswordValid = bcrypt.compareSync(password, user_password);
  return isPasswordValid;
}