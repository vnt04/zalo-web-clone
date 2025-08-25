import React, { Dispatch, FC, useEffect, useState } from "react";
import { Button } from "../common/Button";
import styles from "./index.module.scss";
import { useDispatch } from "react-redux";
import { createConversationThunk } from "../../store/conversationSlice";
import { User } from "../../utils/types";
import { AppDispatch } from "../../store";
import { useNavigate } from "react-router-dom";
import { getConversationByUsername, searchUsers } from "../../utils/api";
import { RecipientResultContainer } from "../recipients/RecipientResultContainer";
import { RecipientField } from "../recipients/RecipientField";
import { isPhoneNumber } from "../../utils/helpers";
import { useToast } from "../../utils/hooks/useToast";

type Props = {
  setShowModal: Dispatch<React.SetStateAction<boolean>>;
};

export const CreateConversationForm: FC<Props> = ({ setShowModal }) => {
  const [query, setQuery] = useState("");
  const [userResult, setUserResult] = useState<User>();
  const [searching, setSearching] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { error } = useToast({ theme: "dark" });

  const handleSearch = (query: string) => {
    if (isPhoneNumber(query.trim())) {
      setSearching(true);
      searchUsers(query.trim())
        .then(({ data }) => {
          console.log(data);
          setUserResult(data);
        })
        .catch((err) => console.log(err))
        .finally(() => setSearching(false));
    } else {
      error("Số điện thoại không hợp lệ.");
    }
  };

  // const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (!selectedUser) return;
  //   return dispatch(
  //     createConversationThunk({ username: selectedUser.username, message: "" })
  //   )
  //     .unwrap()
  //     .then(({ data }) => {
  //       console.log(data);
  //       console.log("done");
  //       setShowModal(false);
  //       navigate(`/conversations/${data.id}`);
  //     })
  //     .catch((err) => console.log(err));
  // };

  useEffect(() => {
    if (!query) {
      setUserResult(undefined);
    }
  }, [query]);

  const handleUserSelect = async () => {
    // find conversation between user & user result
    if (!userResult?.username) return;
    const result = await getConversationByUsername(userResult?.username);

    // navigate to conversation with this user
    setShowModal(false);
    navigate(`conversations/${result.data.id}`);
  };

  return (
    <form className={styles.createConversationForm}>
      <RecipientField setQuery={setQuery} />
      {userResult && query && (
        <RecipientResultContainer
          userResults={userResult}
          handleUserSelect={handleUserSelect}
        />
      )}

      <Button type="button" onClick={() => handleSearch(query)}>
        Tìm kiếm
      </Button>
    </form>
  );
};
