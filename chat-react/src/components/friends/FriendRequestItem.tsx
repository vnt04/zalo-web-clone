import { FC, useContext } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import {
  acceptFriendRequestThunk,
  cancelFriendRequestThunk,
  rejectFriendRequestThunk,
} from "../../store/friends/friendsThunk";
import { AuthContext } from "../../utils/context/AuthContext";
import { getFriendRequestDetails } from "../../utils/helpers";
import { FriendRequest } from "../../utils/types";
import { UserRow } from "../common/UserRow";
import styles from "./index.module.scss";

type Props = {
  friendRequest: FriendRequest;
};

export const FriendRequestItem: FC<Props> = ({ friendRequest }) => {
  const { user } = useContext(AuthContext);
  const dispatch = useDispatch<AppDispatch>();
  const details = getFriendRequestDetails(friendRequest, user);

  return (
    <UserRow
      avatarUrl={details.user.profile?.avatar}
      name={details.displayName}
      subtitle={details.status}
      action={
        <div className={styles.requestActions}>
          {details.incoming ? (
            <>
              <button
                type="button"
                className={styles.acceptAction}
                onClick={() =>
                  dispatch(acceptFriendRequestThunk(friendRequest.id))
                }
              >
                Đồng ý
              </button>
              <button
                type="button"
                className={styles.rejectAction}
                onClick={() =>
                  dispatch(rejectFriendRequestThunk(friendRequest.id))
                }
              >
                Từ chối
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.rejectAction}
              onClick={() =>
                dispatch(cancelFriendRequestThunk(friendRequest.id))
              }
            >
              Thu hồi
            </button>
          )}
        </div>
      }
    />
  );
};
