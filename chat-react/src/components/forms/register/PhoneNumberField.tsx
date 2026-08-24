import { AxiosError } from "axios";
import { FC } from "react";
import { checkPhoneNumberExists } from "../../../utils/api";
import { RegisterFormFieldProps } from "../../../utils/types/form";
import styles from "./index.module.scss";

export const PhoneNumberField: FC<RegisterFormFieldProps> = ({
  register,
  errors,
}) => (
  <div className={styles.group}>
    <div className={styles.field}>
      {/* Khoá ở +84: normalizePhone() bên backend mới chỉ hiểu đầu số Việt Nam. */}
      <select className={styles.countryCode} defaultValue="+84" disabled>
        <option value="+84">+84</option>
      </select>
      <input
        className={styles.input}
        type="tel"
        placeholder="Số điện thoại"
        autoComplete="tel"
        {...register("phoneNumber", {
          required: "Vui lòng nhập số điện thoại",
          pattern: {
            value: /^(?:\+?84|0)?[35789]\d{8}$/,
            message: "Số điện thoại không hợp lệ",
          },
          validate: {
            checkPhoneNumber: async (phoneNumber: string) => {
              try {
                await checkPhoneNumberExists(phoneNumber);
              } catch (err) {
                return (
                  (err as AxiosError).response?.status === 409 &&
                  "Số điện thoại đã được đăng ký"
                );
              }
            },
          },
        })}
      />
    </div>
    {errors.phoneNumber && (
      <div className={styles.fieldError}>{errors.phoneNumber.message}</div>
    )}
  </div>
);
