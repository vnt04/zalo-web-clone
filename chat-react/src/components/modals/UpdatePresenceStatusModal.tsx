import { Dispatch, FC, SetStateAction, useRef } from "react";
import { MdClose } from "react-icons/md";
import { ModalContainer, ModalContentBody, ModalHeader } from ".";
import { UpdateUserStatusForm } from "../forms/status";
import { OverlayStyle } from "../common/Modal";

type Props = {
  setShowModal: Dispatch<SetStateAction<boolean>>;
};

export const UpdatePresenceStatusModal: FC<Props> = ({ setShowModal }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <OverlayStyle ref={ref}>
      <ModalContainer>
        <ModalHeader>
          <h2>Set Custom Status</h2>
          <MdClose size={32} onClick={() => setShowModal(false)} />
        </ModalHeader>
        <ModalContentBody>
          <UpdateUserStatusForm setShowModal={setShowModal} />
        </ModalContentBody>
      </ModalContainer>
    </OverlayStyle>
  );
};
