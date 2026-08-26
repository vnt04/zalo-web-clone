import { useState } from "react";
import { AiOutlineUserAdd } from "react-icons/ai";
import classNames from "classnames";
import { useLocation, useNavigate } from "react-router-dom";
import { friendsNavbarItems } from "../../utils/constants";
import { CreateFriendRequestModal } from "../modals/CreateFriendRequestModal";
import styles from "../friends/index.module.scss";

export const FriendPageNavbar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {showModal && <CreateFriendRequestModal setShowModal={setShowModal} />}
      <nav className={styles.navbar}>
        <div className={styles.tabs}>
          {friendsNavbarItems.map((item) => (
            <button
              type="button"
              key={item.id}
              className={classNames(styles.tab, {
                [styles.tabActive]: pathname === item.pathname,
              })}
              onClick={() => navigate(item.pathname)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.addFriendButton}
          onClick={() => setShowModal(true)}
        >
          <AiOutlineUserAdd size={18} />
          Thêm bạn
        </button>
      </nav>
    </>
  );
};
