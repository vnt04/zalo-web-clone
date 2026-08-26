import { Dispatch, FC, FormEvent, SetStateAction, useState } from "react";
import { MdSearch } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { getConversationByPhoneNumber, searchUsers } from "../../utils/api";
import { formatPhoneNumber, toNationalPhoneNumber } from "../../utils/helpers";
import { useToast } from "../../utils/hooks/useToast";
import { User } from "../../utils/types";
import { ZaloModal, ZaloModalAction } from "../common/Modal/ZaloModal";
import { UserRow } from "../common/UserRow";
import styles from "./index.module.scss";

type Props = {
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

const FORM_ID = "new-conversation-form";

export const CreateConversationModal: FC<Props> = ({ setShowModal }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [result, setResult] = useState<User | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { error } = useToast();
  const navigate = useNavigate();

  const closeModal = () => setShowModal(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const national = toNationalPhoneNumber(phoneNumber);
    if (!national) {
      error("Số điện thoại không hợp lệ");
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await searchUsers(national);
      setResult(data?.id ? data : null);
      setHasSearched(true);
    } catch {
      error("Không tìm kiếm được, thử lại sau");
    } finally {
      setIsSearching(false);
    }
  };

  const openConversation = async (recipient: User) => {
    try {
      const { data } = await getConversationByPhoneNumber(recipient.phoneNumber);
      closeModal();
      navigate(`/conversations/${data.id}`);
    } catch {
      error("Không mở được cuộc trò chuyện");
    }
  };

  return (
    <ZaloModal
      title="Tin nhắn mới"
      onClose={closeModal}
      footer={
        <>
          <ZaloModalAction onClick={closeModal}>Huỷ</ZaloModalAction>
          <ZaloModalAction
            type="submit"
            form={FORM_ID}
            variant="primary"
            disabled={!phoneNumber || isSearching}
          >
            Tìm kiếm
          </ZaloModalAction>
        </>
      }
    >
      <form id={FORM_ID} className={styles.modalBody} onSubmit={onSubmit}>
        <div className={styles.searchField}>
          <MdSearch size={18} />
          <input
            className={styles.searchInput}
            type="tel"
            inputMode="numeric"
            autoFocus
            placeholder="Nhập số điện thoại"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        {hasSearched && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Kết quả tìm kiếm</h3>
            {result ? (
              <UserRow
                avatarUrl={result.profile?.avatar}
                name={`${result.firstName} ${result.lastName}`}
                subtitle={formatPhoneNumber(result.phoneNumber)}
                onClick={() => openConversation(result)}
              />
            ) : (
              <p className={styles.emptyState}>
                Không tìm thấy người dùng với số điện thoại này.
              </p>
            )}
          </section>
        )}
      </form>
    </ZaloModal>
  );
};
