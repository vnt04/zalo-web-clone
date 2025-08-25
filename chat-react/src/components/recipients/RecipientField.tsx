import { FC, Dispatch, SetStateAction } from "react";
import { InputContainer, InputField, InputLabel } from "../common/Input";

type Props = {
  setQuery: Dispatch<SetStateAction<string>>;
};

export const RecipientField: FC<Props> = ({ setQuery }) => (
  <section>
    <InputContainer>
      <InputLabel>Số điện thoại (+84)</InputLabel>
      <InputField onChange={(e) => setQuery(e.target.value)} />
    </InputContainer>
  </section>
);
