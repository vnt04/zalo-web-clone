import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { addGroupRecipient } from "../../utils/api";
import { useToast } from "../../utils/hooks/useToast";
import { InputContainer, InputField, InputLabel } from "../common/Input";
import { Button } from "../common/Button";
import styles from "./index.module.scss";

export const GroupRecipientAddForm = () => {
  const { id: groupId } = useParams();
  const [phoneNumber, setPhoneNumber] = useState("");
  const { success, error } = useToast({ theme: "dark" });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addGroupRecipient({ id: parseInt(groupId!), phoneNumber })
      .then(({ data }) => {
        console.log(data);
        success("Recipient Added to Group");
        setPhoneNumber("");
      })
      .catch((err) => {
        console.log(err);
        error("Failed to add user");
      });
  };

  return (
    <form className={styles.createConversationForm} onSubmit={onSubmit}>
      <InputContainer>
        <InputLabel>Recipient</InputLabel>
        <InputField
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
      </InputContainer>
      <Button style={{ margin: "10px 0" }} disabled={!phoneNumber}>
        Add Recipient
      </Button>
    </form>
  );
};
