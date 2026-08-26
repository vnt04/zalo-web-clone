import { Outlet, useLocation } from "react-router-dom";
import { FriendPageNavbar } from "../../components/navbar/FriendsPageNavbar";
import styles from "../../components/friends/index.module.scss";
import { FriendsPage } from "./FriendsPage";

export const FriendsLayoutPage = () => {
  const { pathname } = useLocation();

  return (
    <div className={styles.friendsPage}>
      <FriendPageNavbar />
      {pathname === "/friends" && <FriendsPage />}
      <Outlet />
    </div>
  );
};
