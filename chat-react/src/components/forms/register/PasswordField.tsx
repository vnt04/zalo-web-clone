import { FC, useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { RegisterFormFieldProps } from "../../../utils/types/form";
import styles from "./index.module.scss";

export const PasswordField: FC<RegisterFormFieldProps> = ({
  register,
  errors,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={styles.group}>
      <div className={styles.field}>
        <input
          className={styles.input}
          type={isVisible ? "text" : "password"}
          placeholder="Mật khẩu"
          autoComplete="new-password"
          {...register("password", {
            required: "Vui lòng nhập mật khẩu",
            minLength: { value: 8, message: "Mật khẩu tối thiểu 8 ký tự" },
            maxLength: { value: 32, message: "Mật khẩu tối đa 32 ký tự" },
          })}
        />
        <button
          type="button"
          className={styles.passwordToggle}
          onClick={() => setIsVisible(!isVisible)}
          aria-label={isVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {isVisible ? (
            <MdVisibilityOff size={20} />
          ) : (
            <MdVisibility size={20} />
          )}
        </button>
      </div>
      {errors.password && (
        <div className={styles.fieldError}>{errors.password.message}</div>
      )}
    </div>
  );
};
