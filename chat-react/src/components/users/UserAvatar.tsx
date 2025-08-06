import { FC } from "react";
import { User } from "../../utils/types";
import defaultAvatar from "../../__assets__/default_avatar.jpg";
import { UserAvatarContainer } from "../common/Sidebar";

type Props = {
  user: User;
  onClick?: (e: React.MouseEvent<HTMLImageElement, MouseEvent>) => void;
};

export const UserAvatar: FC<Props> = ({ user, onClick }) => {
  const getProfilePicture = () => {
    const { profile } = user;
    return profile && profile.avatar ? profile.avatar : defaultAvatar;
  };

  return (
    <UserAvatarContainer
      src={getProfilePicture()}
      alt="avatar"
      onClick={onClick}
    />
  );
};
