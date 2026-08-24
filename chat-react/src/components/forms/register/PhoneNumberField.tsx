import { AxiosError } from "axios";
import { FC, FocusEvent, useRef } from "react";
import { checkPhoneNumberExists } from "../../../utils/api";
import { RegisterFormFieldProps } from "../../../utils/types/form";
import styles from "./index.module.scss";

const PHONE_NUMBER_PATTERN = /^(?:\+?84|0)?[35789]\d{8}$/;
const ALREADY_REGISTERED = "Số điện thoại đã được đăng ký";

export const PhoneNumberField: FC<RegisterFormFieldProps> = ({
  register,
  errors,
  setError,
}) => {
  // Form subscribe isValid, nên RHF chạy lại validator của mọi field sau mỗi ký
  // tự gõ ở bất kỳ ô nào. Vì vậy validate bên dưới phải đồng bộ: nó chỉ đọc lại
  // kết quả đã hỏi API ở onBlur của chính ô này. value -> số đã tồn tại chưa.
  const checked = useRef(new Map<string, boolean>());

  const { onBlur, ...field } = register("phoneNumber", {
    required: "Vui lòng nhập số điện thoại",
    pattern: {
      value: PHONE_NUMBER_PATTERN,
      message: "Số điện thoại không hợp lệ",
    },
    validate: {
      checkPhoneNumber: (phoneNumber: string) =>
        !checked.current.get(phoneNumber) || ALREADY_REGISTERED,
    },
  });

  const handleBlur = async (event: FocusEvent<HTMLInputElement>) => {
    await onBlur(event);
    const phoneNumber = event.target.value;
    // Sai định dạng thì pattern đã báo rồi; số đã hỏi rồi thì không hỏi lại.
    if (!PHONE_NUMBER_PATTERN.test(phoneNumber)) return;
    if (checked.current.has(phoneNumber)) return;

    try {
      await checkPhoneNumberExists(phoneNumber);
      checked.current.set(phoneNumber, false);
    } catch (err) {
      // 429 hoặc lỗi mạng: không chặn form, để lần submit quyết định.
      if ((err as AxiosError).response?.status !== 409) return;
      checked.current.set(phoneNumber, true);
      setError("phoneNumber", {
        type: "checkPhoneNumber",
        message: ALREADY_REGISTERED,
      });
    }
  };

  return (
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
          {...field}
          onBlur={handleBlur}
        />
      </div>
      {errors.phoneNumber && (
        <div className={styles.fieldError}>{errors.phoneNumber.message}</div>
      )}
    </div>
  );
};
