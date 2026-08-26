import { Dispatch, FC, FormEvent, SetStateAction, useState } from "react";
import { useParams } from "react-router-dom";
import { addGroupRecipient } from "../../utils/api";
import { toNationalPhoneNumber } from "../../utils/helpers";
import { useToast } from "../../utils/hooks/useToast";
import { ZaloModal, ZaloModalAction } from "../common/Modal/ZaloModal";
import styles from "./index.module.scss";

type Props = {
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

const FORM_ID = "add-group-recipient-form";

export const AddGroupRecipientModal: FC<Props> = ({ setShowModal }) => {
  const { id: groupId } = useParams();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const { success, error } = useToast();

  const closeModal = () => setShowModal(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const national = toNationalPhoneNumber(phoneNumber);
    if (!national) {
      error("Số điện thoại không hợp lệ");
      return;
    }

    setIsAdding(true);
    try {
      await addGroupRecipient({ id: parseInt(groupId!), phoneNumber: national });
      success("Đã thêm thành viên vào nhóm");
      setPhoneNumber("");
    } catch {
      error("Không thêm được thành viên");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <ZaloModal
      title="Thêm thành viên"
      onClose={closeModal}
      footer={
        <>
          <ZaloModalAction onClick={closeModal}>Huỷ</ZaloModalAction>
          <ZaloModalAction
            type="submit"
            form={FORM_ID}
            variant="primary"
            disabled={!phoneNumber || isAdding}
          >
            Thêm
          </ZaloModalAction>
        </>
      }
    >
      <form id={FORM_ID} className={styles.modalBody} onSubmit={onSubmit}>
        <label className={styles.fieldLabel} htmlFor="recipientPhoneNumber">
          Số điện thoại
        </label>
        <div className={styles.field}>
          <input
            id="recipientPhoneNumber"
            className={styles.fieldInput}
            type="tel"
            inputMode="numeric"
            autoFocus
            placeholder="Nhập số điện thoại"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
      </form>
    </ZaloModal>
  );
};
