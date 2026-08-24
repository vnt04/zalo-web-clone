import { FC } from "react";
import { UseFormRegister } from "react-hook-form";
import { UserCredentialsParams } from "../../../utils/types";
import styles from "./index.module.scss";

type Props = {
  register: UseFormRegister<UserCredentialsParams>;
};

// Dropdown khoá ở +84: normalizePhone() bên backend mới chỉ hiểu đầu số Việt Nam.
export const PhoneField: FC<Props> = ({ register }) => (
  <div className={styles.field}>
    <select className={styles.countryCode} defaultValue="+84" disabled>
      <option value="+84">+84</option>
    </select>
    <input
      className={styles.input}
      type="tel"
      placeholder="Số điện thoại"
      autoComplete="tel"
      {...register("phoneNumber", { required: true })}
    />
  </div>
);
