import React, { FC } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../store";
import { editGroupMessageThunk } from "../../store/groupMessageSlice";
import { setIsEditing } from "../../store/messageContainerSlice";
import { editMessageThunk } from "../../store/messages/messageThunk";
import { selectType } from "../../store/selectedSlice";
import { EditMessagePayload } from "../../utils/types";
import styles from "./index.module.scss";

type Props = {
  onEditMessageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const EditMessageContainer: FC<Props> = ({ onEditMessageChange }) => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { messageBeingEdited } = useSelector(
    (state: RootState) => state.messageContainer
  );
  const conversationType = useSelector((state: RootState) => selectType(state));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageBeingEdited) return;

    const params: EditMessagePayload = {
      id: parseInt(id!),
      messageId: messageBeingEdited.id,
      content: messageBeingEdited.content || "",
    };
    const request =
      conversationType === "private"
        ? dispatch(editMessageThunk(params))
        : dispatch(editGroupMessageThunk(params));
    request.finally(() => dispatch(setIsEditing(false)));
  };

  return (
    <div className={styles.editMessage}>
      <form onSubmit={onSubmit}>
        <input
          className={styles.editMessageInput}
          autoFocus
          value={messageBeingEdited?.content}
          onChange={onEditMessageChange}
        />
      </form>
      <div className={styles.editMessageHint}>
        Nhấn <b>Esc</b> để huỷ, <b>Enter</b> để lưu
      </div>
    </div>
  );
};
