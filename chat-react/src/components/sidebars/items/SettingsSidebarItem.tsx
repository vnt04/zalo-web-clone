import { FC } from "react";
import classNames from "classnames";
import { useLocation, useNavigate } from "react-router-dom";
import { getSettingSidebarIcon } from "../../../utils/helpers";
import { SettingsItemType } from "../../../utils/types";
import styles from "../../settings/index.module.scss";

type Props = {
  item: SettingsItemType;
};

const ICON_SIZE = 20;

export const SettingsSidebarItem: FC<Props> = ({ item }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const Icon = getSettingSidebarIcon(item.id);

  return (
    <button
      type="button"
      className={classNames(styles.sidebarItem, {
        [styles.sidebarItemActive]: pathname === item.pathname,
      })}
      onClick={() => navigate(item.pathname)}
    >
      <Icon size={ICON_SIZE} />
      <span>{item.label}</span>
    </button>
  );
};
