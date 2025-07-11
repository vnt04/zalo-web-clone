import { useEffect, useState } from "react";
import { AiOutlineUserAdd, AiOutlineUsergroupAdd } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  setContextMenuLocation,
  setSelectedGroup,
  toggleContextMenu,
} from "../../store/groupSlice";
import { ScrollableContainer } from "../../utils/styles";
import { ContextMenuEvent, Group } from "../../utils/types";
import { GroupSidebarContextMenu } from "../context-menus/GroupSidebarContextMenu";
import { ConversationSidebarItem } from "../conversations/ConversationSidebarItem";
import { GroupSidebarItem } from "../groups/GroupSidebarItem";
import { CreateConversationModal } from "../modals/CreateConversationModal";
import { CreateGroupModal } from "../modals/CreateGroupModal";
import { SidebarHeader, SidebarStyle } from "../common/Sidebar";
import { SearchInput } from "../common/Search";

export const ConversationSidebar = () => {
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const conversations = useSelector(
    (state: RootState) => state.conversation.conversations
  );
  const showGroupContextMenu = useSelector(
    (state: RootState) => state.groups.showGroupContextMenu
  );
  const groups = useSelector((state: RootState) => state.groups.groups);
  const conversationType = useSelector(
    (state: RootState) => state.selectedConversationType.type
  );

  const onGroupContextMenu = (event: ContextMenuEvent, group: Group) => {
    event.preventDefault();
    console.log("Group Context Menu");
    console.log(group);
    dispatch(toggleContextMenu(true));
    dispatch(setContextMenuLocation({ x: event.pageX, y: event.pageY }));
    dispatch(setSelectedGroup(group));
  };

  useEffect(() => {
    const handleResize = (e: UIEvent) => dispatch(toggleContextMenu(false));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClick = () => dispatch(toggleContextMenu(false));
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <>
      {showModal && conversationType === "private" && (
        <CreateConversationModal setShowModal={setShowModal} />
      )}
      {showModal && conversationType === "group" && (
        <CreateGroupModal setShowModal={setShowModal} />
      )}
      <SidebarStyle>
        <SidebarHeader>
          <SearchInput placeholder="Tìm kiếm" />
          {/* {conversationType === "private" ? (
            <AiOutlineUserAdd
              size={30}
              cursor="pointer"
              onClick={() => setShowModal(true)}
            />
          ) : (
            <AiOutlineUsergroupAdd
              size={30}
              cursor="pointer"
              onClick={() => setShowModal(true)}
            />
          )} */}
          <AiOutlineUserAdd
            size={30}
            cursor="pointer"
            onClick={() => setShowModal(true)}
          />
          <AiOutlineUsergroupAdd
            size={30}
            cursor="pointer"
            onClick={() => setShowModal(true)}
          />
        </SidebarHeader>
        {/* usage => ConversationTab: This component display "Private" and "Group" tab */}
        {/* <ConversationTab /> */}
        <ScrollableContainer>
          <>
            {conversationType === "private"
              ? conversations.map((conversation) => (
                  <ConversationSidebarItem
                    key={conversation.id}
                    conversation={conversation}
                  />
                ))
              : groups.map((group) => (
                  <GroupSidebarItem
                    key={group.id}
                    group={group}
                    onContextMenu={onGroupContextMenu}
                  />
                ))}
            {showGroupContextMenu && <GroupSidebarContextMenu />}
          </>
        </ScrollableContainer>
        <footer></footer>
      </SidebarStyle>
    </>
  );
};
