import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { postRegisterUser } from "../../../utils/api";
import { useToast } from "../../../utils/hooks/useToast";
import { CreateUserParams } from "../../../utils/types";
import { NameField } from "./NameField";
import { PasswordField } from "./PasswordField";
import { PhoneNumberField } from "./PhoneNumberField";
import styles from "./index.module.scss";

export const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreateUserParams>({ mode: "onChange" });

  const navigate = useNavigate();
  const { success, error } = useToast();

  const onSubmit = async (data: CreateUserParams) => {
    try {
      await postRegisterUser(data);
      navigate("/login");
      success("Tạo tài khoản thành công!");
    } catch (err: any) {
      error(messageFor(err?.response?.status));
    }
  };

  const formFieldProps = { errors, register };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.logo}>Zalo</div>
      <div className={styles.heading}>Tạo tài khoản mới</div>
      <PhoneNumberField {...formFieldProps} />
      <NameField {...formFieldProps} />
      <PasswordField {...formFieldProps} />
      <button className={styles.submit} disabled={!isValid || isSubmitting}>
        Đăng ký
      </button>
      <div className={styles.footer}>
        <span>Đã có tài khoản? </span>
        <Link to="/login">Đăng nhập</Link>
      </div>
    </form>
  );
};

function messageFor(status?: number): string {
  if (status === 400) return "Số điện thoại không hợp lệ";
  if (status === 409) return "Số điện thoại đã được đăng ký";
  if (status === 429) return "Bạn thử quá nhiều lần. Vui lòng đợi một lát";
  return "Tạo tài khoản thất bại. Vui lòng thử lại";
}
