import { useState, useContext } from "react";
import { userSidebarItems } from "../../utils/constants";
import { UserSidebarItem } from "./items/UserSidebarItem";
import { AuthContext } from "../../utils/context/AuthContext";
import { UpdatePresenceStatusModal } from "../modals/UpdatePresenceStatusModal";
import { RiLogoutCircleLine } from "react-icons/ri";
import { UserAvatar } from "../users/UserAvatar";
import { useNavigate } from "react-router-dom";
import {
  UserSidebarHeader,
  UserSidebarScrollableContainer,
  UserSidebarStyle,
} from "../common/Sidebar";
import styles from "./index.module.scss";

export const UserSidebar = () => {
  const [showModal, setShowModal] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () =>
    logout().then(() => navigate("/login", { replace: true }));

  return (
    <>
      {showModal && <UpdatePresenceStatusModal setShowModal={setShowModal} />}
      <UserSidebarStyle>
        <UserSidebarHeader>
          <UserAvatar user={user!} onClick={() => setShowModal(true)} />
        </UserSidebarHeader>
        <UserSidebarScrollableContainer>
          {userSidebarItems
            .filter((item) => item.group === "primary")
            .map((item) => (
              <UserSidebarItem item={item} key={item.id} />
            ))}
        </UserSidebarScrollableContainer>

        <div className={styles.railUtilityGroup}>
          <div className={styles.railDivider} />
          {userSidebarItems
            .filter((item) => item.group === "utility")
            .map((item) => (
              <UserSidebarItem item={item} key={item.id} />
            ))}
          <button
            className={styles.railLogout}
            title="Đăng xuất"
            onClick={handleLogout}
          >
            <RiLogoutCircleLine size={24} />
          </button>
        </div>
      </UserSidebarStyle>
    </>
  );
};
