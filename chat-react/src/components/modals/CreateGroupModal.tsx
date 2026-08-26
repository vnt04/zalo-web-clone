import { Dispatch, FC, FormEvent, SetStateAction, useState } from "react";
import { MdClose, MdSearch } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch } from "../../store";
import { createGroupThunk } from "../../store/groupSlice";
import { searchUsers } from "../../utils/api";
import { formatPhoneNumber, toNationalPhoneNumber } from "../../utils/helpers";
import { useToast } from "../../utils/hooks/useToast";
import { User } from "../../utils/types";
import { ZaloModal, ZaloModalAction } from "../common/Modal/ZaloModal";
import { UserRow } from "../common/UserRow";
import defaultAvatar from "../../__assets__/default_avatar.jpg";
import styles from "./index.module.scss";

type Props = {
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

const FORM_ID = "create-group-form";

export const CreateGroupModal: FC<Props> = ({ setShowModal }) => {
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<User | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [members, setMembers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { error } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const closeModal = () => setShowModal(false);

  const searchMember = async () => {
    const national = toNationalPhoneNumber(query);
    if (!national) {
      error("Số điện thoại không hợp lệ");
      return;
    }
    try {
      const { data } = await searchUsers(national);
      setResult(data?.id ? data : null);
      setHasSearched(true);
    } catch {
      error("Không tìm kiếm được, thử lại sau");
    }
  };

  const addMember = (user: User) => {
    setMembers((prev) =>
      prev.some((member) => member.id === user.id) ? prev : [...prev, user]
    );
    setQuery("");
    setResult(null);
    setHasSearched(false);
  };

  const removeMember = (user: User) =>
    setMembers((prev) => prev.filter((member) => member.id !== user.id));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data } = await dispatch(
        createGroupThunk({
          title: title.trim(),
          users: members.map((member) => member.phoneNumber),
        })
      ).unwrap();
      closeModal();
      navigate(`/groups/${data.id}`);
    } catch {
      error("Không tạo được nhóm");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ZaloModal
      title="Tạo nhóm"
      onClose={closeModal}
      footer={
        <>
          <ZaloModalAction onClick={closeModal}>Huỷ</ZaloModalAction>
          <ZaloModalAction
            type="submit"
            form={FORM_ID}
            variant="primary"
            disabled={!title.trim() || members.length === 0 || isCreating}
          >
            Tạo nhóm
          </ZaloModalAction>
        </>
      }
    >
      <form id={FORM_ID} className={styles.modalBody} onSubmit={onSubmit}>
        <div className={styles.field}>
          <input
            className={styles.fieldInput}
            autoFocus
            placeholder="Nhập tên nhóm..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <section className={styles.section}>
          <div className={styles.searchField}>
            <MdSearch size={18} />
            <input
              className={styles.searchInput}
              type="tel"
              inputMode="numeric"
              placeholder="Nhập số điện thoại để thêm thành viên"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              // Enter ở ô này là tìm thành viên, không phải gửi form tạo nhóm.
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                searchMember();
              }}
            />
          </div>

          {hasSearched &&
            (result ? (
              <div className={styles.resultList}>
                <UserRow
                  avatarUrl={result.profile?.avatar}
                  name={`${result.firstName} ${result.lastName}`}
                  subtitle={formatPhoneNumber(result.phoneNumber)}
                  action={
                    <button
                      type="button"
                      className={styles.outlineAction}
                      disabled={members.some((m) => m.id === result.id)}
                      onClick={() => addMember(result)}
                    >
                      {members.some((m) => m.id === result.id)
                        ? "Đã thêm"
                        : "Thêm"}
                    </button>
                  }
                />
              </div>
            ) : (
              <p className={styles.emptyState}>
                Không tìm thấy người dùng với số điện thoại này.
              </p>
            ))}
        </section>

        {members.length > 0 && (
          <div className={styles.chipList}>
            {members.map((member) => (
              <span className={styles.chip} key={member.id}>
                <img
                  className={styles.chipAvatar}
                  src={member.profile?.avatar ?? defaultAvatar}
                  alt=""
                />
                {member.firstName} {member.lastName}
                <button
                  type="button"
                  className={styles.chipRemove}
                  aria-label={`Bỏ ${member.firstName} ${member.lastName}`}
                  onClick={() => removeMember(member)}
                >
                  <MdClose size={16} />
                </button>
              </span>
            ))}
          </div>
        )}
      </form>
    </ZaloModal>
  );
};
