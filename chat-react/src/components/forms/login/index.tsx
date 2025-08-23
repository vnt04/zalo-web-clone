import { useContext } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { postLoginUser } from "../../../utils/api";
import { SocketContext } from "../../../utils/context/SocketContext";
import { UserCredentialsParams } from "../../../utils/types";
import styles from "../index.module.scss";
import { InputContainer, InputField, InputLabel } from "../../common/Input";
import { Button } from "../../common/button";

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCredentialsParams>();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);

  const onSubmit = async (data: UserCredentialsParams) => {
    console.log("called");
    console.log(socket);
    console.log(socket.connected);
    try {
      await postLoginUser(data);
      console.log("Success");
      socket.connect();
      console.log(socket.connected);
      navigate("/conversations");
    } catch (err) {
      console.log(socket.connected);
      console.log(err);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <InputContainer>
        <InputLabel htmlFor="username">Phone number (+84)</InputLabel>
        <InputField
          type="text"
          id="username"
          placeholder="ex: 0123456789"
          {...register("username", { required: true })}
        />
      </InputContainer>
      <InputContainer className={styles.loginFormPassword}>
        <InputLabel htmlFor="password">Password</InputLabel>
        <InputField
          type="password"
          id="password"
          placeholder="************"
          {...register("password", { required: true })}
        />
      </InputContainer>
      <Button>Login</Button>
      <div className={styles.footerText}>
        <span>Don't have an account? </span>
        <Link to="/register">
          <span>Register</span>
        </Link>
      </div>
    </form>
  );
};
