import { FormEvent, useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  setIsSavingChanges,
  setShowEditGroupModal,
  updateGroupDetailsThunk,
} from "../../store/groupSlice";
import { CDN_URL } from "../../utils/constants";
import { useBeforeUnload } from "../../utils/hooks";
import { useToast } from "../../utils/hooks/useToast";
import { ZaloModal, ZaloModalAction } from "../common/Modal/ZaloModal";
import defaultAvatar from "../../__assets__/default_avatar.jpg";
import styles from "./index.module.scss";

const FORM_ID = "edit-group-form";

export const EditGroupModal = () => {
  const { selectedGroupContextMenu: group, isSavingChanges } = useSelector(
    (state: RootState) => state.groups
  );
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState(group?.title || "");
  const { success, error } = useToast();

  const isStateChanged = useCallback(
    () => Boolean(file) || group?.title !== title,
    [file, title, group?.title]
  );

  useBeforeUnload(
    (e) => isStateChanged() && (e.returnValue = "Bạn có thay đổi chưa lưu"),
    [isStateChanged]
  );

  const closeModal = () => !isSavingChanges && dispatch(setShowEditGroupModal(false));

  const currentAvatar = group?.avatar
    ? CDN_URL.BASE.concat(group.avatar)
    : defaultAvatar;

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.item(0);
    if (!picked) return;
    setPreview(URL.createObjectURL(picked));
    setFile(picked);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!group) return;

    const formData = new FormData();
    if (file) formData.append("avatar", file);
    if (title && title !== group.title) formData.append("title", title);

    dispatch(setIsSavingChanges(true));
    try {
      await dispatch(updateGroupDetailsThunk({ id: group.id, data: formData }));
      dispatch(setShowEditGroupModal(false));
      success("Đã cập nhật thông tin nhóm");
    } catch {
      error("Không lưu được thay đổi");
    } finally {
      dispatch(setIsSavingChanges(false));
    }
  };

  return (
    <ZaloModal
      title="Thông tin nhóm"
      onClose={closeModal}
      footer={
        <>
          <ZaloModalAction onClick={closeModal} disabled={isSavingChanges}>
            Huỷ
          </ZaloModalAction>
          <ZaloModalAction
            type="submit"
            form={FORM_ID}
            variant="primary"
            disabled={!isStateChanged() || isSavingChanges}
          >
            Lưu
          </ZaloModalAction>
        </>
      }
    >
      <form id={FORM_ID} className={styles.modalBody} onSubmit={onSubmit}>
        <div className={styles.avatarUpload}>
          <img
            className={styles.avatarPreview}
            src={preview || currentAvatar}
            alt=""
          />
          <button
            type="button"
            className={styles.avatarPick}
            onClick={() => fileInputRef.current?.click()}
            disabled={isSavingChanges}
          >
            Đổi ảnh nhóm
          </button>
          <input
            className={styles.hiddenFileInput}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
          />
        </div>

        <label className={styles.fieldLabel} htmlFor="groupTitle">
          Tên nhóm
        </label>
        <div className={styles.field}>
          <input
            id="groupTitle"
            className={styles.fieldInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSavingChanges}
          />
        </div>
      </form>
    </ZaloModal>
  );
};
