import { FC } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { COUNTRY_DIAL_CODES } from "../../../utils/constants";
import styles from "./index.module.scss";

type Props = {
  dialCode: string;
  onDialCodeChange: (dialCode: string) => void;
  phoneNumber: string;
  onPhoneNumberChange: (phoneNumber: string) => void;
};

export const PhoneNumberField: FC<Props> = ({
  dialCode,
  onDialCodeChange,
  phoneNumber,
  onPhoneNumberChange,
}) => {
  const country = COUNTRY_DIAL_CODES.find((item) => item.dialCode === dialCode);

  return (
    <div className={styles.phoneRow}>
      <div className={styles.dialCodeField}>
        <span className={styles.flag} aria-hidden="true">
          {country?.flag}
        </span>
        <select
          className={styles.dialCodeSelect}
          value={dialCode}
          onChange={(e) => onDialCodeChange(e.target.value)}
          aria-label="Mã vùng"
        >
          {COUNTRY_DIAL_CODES.map((item) => (
            <option key={item.code} value={item.dialCode}>
              (+{item.dialCode})
            </option>
          ))}
        </select>
        <MdKeyboardArrowDown className={styles.dialCodeCaret} size={20} />
      </div>
      <div className={styles.phoneField}>
        <input
          className={styles.phoneInput}
          type="tel"
          inputMode="numeric"
          autoFocus
          placeholder="Số điện thoại"
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value)}
        />
      </div>
    </div>
  );
};
