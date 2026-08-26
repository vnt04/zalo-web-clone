import { Dispatch, FC, FormEvent, SetStateAction, useState } from "react";
import { useDispatch } from "react-redux";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { AppDispatch } from "../../store";
import { createFriendRequestThunk } from "../../store/friends/friendsThunk";
import { searchUsers } from "../../utils/api";
import { formatPhoneNumber, toNationalPhoneNumber } from "../../utils/helpers";
import { useToast } from "../../utils/hooks/useToast";
import { User } from "../../utils/types";
import { ZaloModal, ZaloModalAction } from "../common/Modal/ZaloModal";
import { UserRow } from "../common/UserRow";
import { PhoneNumberField } from "./add-friend/PhoneNumberField";
import styles from "./add-friend/index.module.scss";

type Props = {
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

const DEFAULT_DIAL_CODE = "84";
// Nút "Tìm kiếm" nằm ở footer, ngoài thẻ form, nên phải nối lại bằng id.
const FORM_ID = "add-friend-form";

export const CreateFriendRequestModal: FC<Props> = ({ setShowModal }) => {
  const [dialCode, setDialCode] = useState(DEFAULT_DIAL_CODE);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [result, setResult] = useState<User | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isRequestSent, setIsRequestSent] = useState(false);
  const { success, error } = useToast();
  const dispatch = useDispatch<AppDispatch>();

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
      const { data } = await searchUsers(`${dialCode}${national}`);
      setResult(data?.id ? data : null);
      setIsRequestSent(false);
      setHasSearched(true);
    } catch {
      error("Không tìm kiếm được, thử lại sau");
    } finally {
      setIsSearching(false);
    }
  };

  const sendFriendRequest = async (recipient: User) => {
    try {
      await dispatch(createFriendRequestThunk(recipient.phoneNumber)).unwrap();
      setIsRequestSent(true);
      success("Đã gửi lời mời kết bạn");
    } catch {
      error("Không gửi được lời mời kết bạn");
    }
  };

  return (
    <ZaloModal
      title="Thêm bạn"
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
      <form id={FORM_ID} className={styles.addFriendBody} onSubmit={onSubmit}>
        <PhoneNumberField
          dialCode={dialCode}
          onDialCodeChange={setDialCode}
          phoneNumber={phoneNumber}
          onPhoneNumberChange={setPhoneNumber}
        />

        {hasSearched && (
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Kết quả gần nhất</h3>
            {result ? (
              <UserRow
                avatarUrl={result.profile?.avatar}
                name={`${result.firstName} ${result.lastName}`}
                subtitle={formatPhoneNumber(result.phoneNumber)}
                action={
                  <button
                    type="button"
                    className={styles.addFriendAction}
                    disabled={isRequestSent}
                    onClick={() => sendFriendRequest(result)}
                  >
                    {isRequestSent ? "Đã gửi" : "Kết bạn"}
                  </button>
                }
              />
            ) : (
              <p className={styles.emptyState}>
                Không tìm thấy người dùng với số điện thoại này.
              </p>
            )}
          </section>
        )}

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <AiOutlineUsergroupAdd size={16} />
            Có thể bạn quen
          </h3>
          <p className={styles.emptyState}>Chưa có gợi ý nào.</p>
        </section>
      </form>
    </ZaloModal>
  );
};
