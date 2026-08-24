import { FC } from "react";
import { UseFormRegister } from "react-hook-form";
import { MdRefresh } from "react-icons/md";
import { UserCredentialsParams } from "../../../utils/types";
import styles from "./index.module.scss";

type Props = {
  register: UseFormRegister<UserCredentialsParams>;
  svg: string;
  onRefresh: () => void;
};

export const CaptchaField: FC<Props> = ({ register, svg, onRefresh }) => (
  <div className={styles.field}>
    <input
      className={styles.input}
      type="text"
      placeholder="Mã kiểm tra"
      autoComplete="off"
      {...register("captcha", { required: true })}
    />
    {/* SVG do backend của mình sinh ra, không phải dữ liệu người dùng. */}
    <div
      className={styles.captchaImage}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
    <button
      type="button"
      className={styles.refresh}
      onClick={onRefresh}
      aria-label="Lấy mã kiểm tra khác"
    >
      <MdRefresh size={20} />
    </button>
  </div>
);
