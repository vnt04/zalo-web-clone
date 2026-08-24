import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { getCaptcha, postLoginUser } from "../../../utils/api";
import { SocketContext } from "../../../utils/context/SocketContext";
import { useToast } from "../../../utils/hooks/useToast";
import { UserCredentialsParams } from "../../../utils/types";
import { CaptchaField } from "./CaptchaField";
import { PasswordField } from "./PasswordField";
import { PhoneField } from "./PhoneField";
import styles from "./index.module.scss";

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    resetField,
    formState: { isValid, isSubmitting },
  } = useForm<UserCredentialsParams>({ mode: "onChange" });
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const { success } = useToast();
  const [svg, setSvg] = useState("");
  const [error, setError] = useState("");

  const loadCaptcha = async () => {
    try {
      const { data } = await getCaptcha();
      setSvg(data.svg);
      resetField("captcha");
    } catch {
      setSvg("");
      setError("Không lấy được mã kiểm tra. Vui lòng thử lại");
    }
  };

  useEffect(() => {
    loadCaptcha();
  }, []);

  const onSubmit = async (data: UserCredentialsParams) => {
    setError("");
    try {
      await postLoginUser(data);
      socket.connect();
      navigate("/conversations");
      success("Đăng nhập thành công!");
    } catch (err: any) {
      setError(messageFor(err?.response?.status));
      // Captcha dùng một lần — không lấy mã mới thì lần thử sau chắc chắn sai.
      loadCaptcha();
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.logo}>Zalo</div>
      <div className={styles.heading}>Đăng nhập với số điện thoại</div>
      <PhoneField register={register} />
      <PasswordField register={register} />
      <CaptchaField register={register} svg={svg} onRefresh={loadCaptcha} />
      {error && <div className={styles.error}>{error}</div>}
      <button className={styles.submit} disabled={!isValid || isSubmitting}>
        Đăng nhập
      </button>
      <div className={styles.footer}>
        <span>Chưa có tài khoản? </span>
        <Link to="/register">Đăng ký</Link>
      </div>
    </form>
  );
};

function messageFor(status?: number): string {
  if (status === 400) return "Mã kiểm tra không đúng";
  if (status === 401) return "Số điện thoại hoặc mật khẩu không đúng";
  if (status === 429) return "Bạn thử quá nhiều lần. Vui lòng đợi một lát";
  return "Đăng nhập thất bại. Vui lòng thử lại";
}
