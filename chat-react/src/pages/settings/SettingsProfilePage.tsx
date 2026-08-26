import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { MdPhotoCamera } from "react-icons/md";
import { updateUserProfile } from "../../utils/api";
import { AuthContext } from "../../utils/context/AuthContext";
import { formatPhoneNumber } from "../../utils/helpers";
import { useToast } from "../../utils/hooks/useToast";
import defaultAvatar from "../../__assets__/default_avatar.jpg";
import styles from "../../components/settings/index.module.scss";

export const SettingsProfilePage = () => {
  const { user, updateAuthUser } = useContext(AuthContext);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File>();
  const [bannerFile, setBannerFile] = useState<File>();
  const [avatarPreview, setAvatarPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [about, setAbout] = useState(user?.profile?.about || "");
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    setAbout(user?.profile?.about || "");
  }, [user?.profile?.about]);

  const savedAvatar = user?.profile?.avatar || defaultAvatar;
  const savedBanner = user?.profile?.banner || "";
  const isChanged =
    Boolean(avatarFile) ||
    Boolean(bannerFile) ||
    about !== (user?.profile?.about || "");

  const pickFile = (
    e: ChangeEvent<HTMLInputElement>,
    setFile: (file: File) => void,
    setPreview: (url: string) => void
  ) => {
    const file = e.target.files?.item(0);
    if (!file) return;
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const reset = () => {
    URL.revokeObjectURL(avatarPreview);
    URL.revokeObjectURL(bannerPreview);
    setAvatarFile(undefined);
    setBannerFile(undefined);
    setAvatarPreview("");
    setBannerPreview("");
    setAbout(user?.profile?.about || "");
  };

  const save = async () => {
    const formData = new FormData();
    if (avatarFile) formData.append("avatar", avatarFile);
    if (bannerFile) formData.append("banner", bannerFile);
    if (about !== (user?.profile?.about || "")) formData.append("about", about);

    setIsSaving(true);
    try {
      const { data: updatedUser } = await updateUserProfile(formData);
      updateAuthUser(updatedUser);
      reset();
      success("Đã cập nhật thông tin");
    } catch {
      error("Không cập nhật được thông tin");
    } finally {
      setIsSaving(false);
    }
  };

  const bannerStyle = bannerPreview || savedBanner;

  return (
    <>
      <button
        type="button"
        className={styles.banner}
        style={
          bannerStyle ? { backgroundImage: `url(${bannerStyle})` } : undefined
        }
        onClick={() => bannerInputRef.current?.click()}
        aria-label="Đổi ảnh bìa"
      >
        <span className={styles.mediaHint}>
          <MdPhotoCamera size={16} />
          Đổi ảnh bìa
        </span>
      </button>
      <input
        className={styles.hiddenFileInput}
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => pickFile(e, setBannerFile, setBannerPreview)}
      />

      <div className={styles.profileHeader}>
        <button
          type="button"
          className={styles.avatarButton}
          onClick={() => avatarInputRef.current?.click()}
          aria-label="Đổi ảnh đại diện"
        >
          <img
            className={styles.avatar}
            src={avatarPreview || savedAvatar}
            alt=""
          />
          <span className={styles.avatarHint}>
            <MdPhotoCamera size={22} />
          </span>
        </button>
        <input
          className={styles.hiddenFileInput}
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => pickFile(e, setAvatarFile, setAvatarPreview)}
        />

        <div className={styles.profileIdentity}>
          <span className={styles.profileName}>
            {user?.firstName} {user?.lastName}
          </span>
          <span className={styles.profilePhone}>
            {user ? formatPhoneNumber(user.phoneNumber) : ""}
          </span>
        </div>
      </div>

      <div className={styles.profileBody}>
        <label className={styles.sectionLabel} htmlFor="about">
          Giới thiệu bản thân
        </label>
        <textarea
          id="about"
          className={styles.about}
          maxLength={200}
          placeholder="Viết vài dòng về bạn..."
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />

        {isChanged && (
          <div className={styles.actionBar}>
            <span>Bạn có thay đổi chưa lưu</span>
            <div className={styles.actionButtons}>
              <button
                type="button"
                className={styles.resetAction}
                onClick={reset}
                disabled={isSaving}
              >
                Huỷ
              </button>
              <button
                type="button"
                className={styles.saveAction}
                onClick={save}
                disabled={isSaving}
              >
                Cập nhật
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
