import { FC } from "react";
import { User } from "../../utils/types";
import {
  RecipientResultContainerStyle,
  RecipientScrollableItemContainer,
} from ".";
import { RecipientResultItem } from "./RecipientResultItem";

type Props = {
  userResults: User;
  handleUserSelect: (user: User) => void;
};

export const RecipientResultContainer: FC<Props> = ({
  userResults,
  handleUserSelect,
}) => {
  return (
    <RecipientResultContainerStyle>
      <RecipientScrollableItemContainer>
        <div
          style={{ fontWeight: "600", margin: "4px 0", color: "var(--text)" }}
        >
          Kết quả tìm thấy
        </div>
        {userResults && (
          <RecipientResultItem
            user={userResults}
            onClick={() => handleUserSelect(userResults)}
          ></RecipientResultItem>
        )}
      </RecipientScrollableItemContainer>
    </RecipientResultContainerStyle>
  );
};
