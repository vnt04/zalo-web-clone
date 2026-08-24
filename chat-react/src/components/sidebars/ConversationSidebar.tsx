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
import { SearchBox } from "../common/Search";
import styles from "./index.module.scss";
import classNames from "classnames";

export const ConversationSidebar = () => {
  const [showModal, setShowModal] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
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

  const visibleConversations = unreadOnly
    ? conversations.filter((conversation) => (conversation.unreadCount ?? 0) > 0)
    : conversations;

  const onGroupContextMenu = (event: ContextMenuEvent, group: Group) => {
    event.preventDefault();
    console.log("Group Context Menu");
    console.log(group);
    dispatch(toggleContextMenu(true));
    dispatch(setContextMenuLocation({ x: event.pageX, y: event.pageY }));
    dispatch(setSelectedGroup(group));
  };

  useEffect(() => {
    const handleResize = (_e: UIEvent) => dispatch(toggleContextMenu(false));
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
          <SearchBox placeholder="Tìm kiếm" />
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
          <button
            className={styles.headerAction}
            title="Thêm bạn"
            onClick={() => setShowModal(true)}
          >
            <AiOutlineUserAdd size={20} />
          </button>
          <button
            className={styles.headerAction}
            title="Tạo nhóm chat"
            onClick={() => setShowModal(true)}
          >
            <AiOutlineUsergroupAdd size={20} />
          </button>
        </SidebarHeader>
        {conversationType === "private" && (
          <div className={styles.tabs}>
            <button
              className={classNames(styles.tab, !unreadOnly && styles.tabActive)}
              onClick={() => setUnreadOnly(false)}
            >
              Tất cả
            </button>
            <button
              className={classNames(styles.tab, unreadOnly && styles.tabActive)}
              onClick={() => setUnreadOnly(true)}
            >
              Chưa đọc
            </button>
          </div>
        )}
        <ScrollableContainer>
          <>
            {conversationType === "private"
              ? visibleConversations.map((conversation) => (
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
            {conversationType === "private" &&
              unreadOnly &&
              visibleConversations.length === 0 && (
                <p className={styles.emptyTab}>Không có hội thoại chưa đọc</p>
              )}
            {showGroupContextMenu && <GroupSidebarContextMenu />}
          </>
        </ScrollableContainer>
        <footer></footer>
      </SidebarStyle>
    </>
  );
};
