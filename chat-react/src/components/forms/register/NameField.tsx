import { FC } from "react";
import { RegisterFormFieldProps } from "../../../utils/types/form";
import styles from "./index.module.scss";

export const NameField: FC<RegisterFormFieldProps> = ({ register, errors }) => (
  <div className={styles.nameRow}>
    <div className={styles.group}>
      <div className={styles.field}>
        <input
          className={styles.input}
          type="text"
          placeholder="Họ"
          autoComplete="family-name"
          {...register("lastName", {
            required: "Vui lòng nhập họ",
            maxLength: { value: 32, message: "Tối đa 32 ký tự" },
          })}
        />
      </div>
      {errors.lastName && (
        <div className={styles.fieldError}>{errors.lastName.message}</div>
      )}
    </div>
    <div className={styles.group}>
      <div className={styles.field}>
        <input
          className={styles.input}
          type="text"
          placeholder="Tên"
          autoComplete="given-name"
          {...register("firstName", {
            required: "Vui lòng nhập tên",
            maxLength: { value: 32, message: "Tối đa 32 ký tự" },
          })}
        />
      </div>
      {errors.firstName && (
        <div className={styles.fieldError}>{errors.firstName.message}</div>
      )}
    </div>
  </div>
);
