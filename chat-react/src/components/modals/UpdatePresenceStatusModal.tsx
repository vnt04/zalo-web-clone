import {
  Dispatch,
  FC,
  FormEvent,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { updateStatusMessage } from "../../utils/api";
import { AuthContext } from "../../utils/context/AuthContext";
import { useToast } from "../../utils/hooks/useToast";
import { ZaloModal, ZaloModalAction } from "../common/Modal/ZaloModal";
import styles from "./index.module.scss";

type Props = {
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

const FORM_ID = "update-status-form";

export const UpdatePresenceStatusModal: FC<Props> = ({ setShowModal }) => {
  const { user } = useContext(AuthContext);
  const [statusMessage, setStatusMessage] = useState(
    user?.presence?.statusMessage || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  const closeModal = () => setShowModal(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateStatusMessage({ statusMessage });
      success("Đã cập nhật trạng thái");
      closeModal();
    } catch {
      error("Không cập nhật được trạng thái");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ZaloModal
      title="Cập nhật trạng thái"
      onClose={closeModal}
      footer={
        <>
          <ZaloModalAction onClick={closeModal}>Huỷ</ZaloModalAction>
          <ZaloModalAction
            type="submit"
            form={FORM_ID}
            variant="primary"
            disabled={isSaving}
          >
            Lưu
          </ZaloModalAction>
        </>
      }
    >
      <form id={FORM_ID} className={styles.modalBody} onSubmit={onSubmit}>
        <label className={styles.fieldLabel} htmlFor="statusMessage">
          Bạn đang nghĩ gì?
        </label>
        <div className={styles.field}>
          <input
            id="statusMessage"
            className={styles.fieldInput}
            autoFocus
            maxLength={60}
            placeholder="Nhập trạng thái của bạn"
            value={statusMessage}
            onChange={(e) => setStatusMessage(e.target.value)}
          />
        </div>
      </form>
    </ZaloModal>
  );
};
