import { FC, useState } from "react";
import { UseFormRegister } from "react-hook-form";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { UserCredentialsParams } from "../../../utils/types";
import styles from "./index.module.scss";

type Props = {
  register: UseFormRegister<UserCredentialsParams>;
};

export const PasswordField: FC<Props> = ({ register }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={styles.field}>
      <input
        className={styles.input}
        type={isVisible ? "text" : "password"}
        placeholder="Mật khẩu"
        autoComplete="current-password"
        {...register("password", { required: true })}
      />
      <button
        type="button"
        className={styles.passwordToggle}
        onClick={() => setIsVisible(!isVisible)}
        aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {isVisible ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
      </button>
    </div>
  );
};
