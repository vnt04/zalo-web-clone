import { settingsItems } from "../../../utils/constants";
import { SettingsSidebarItem } from "../items/SettingsSidebarItem";
import styles from "../../settings/index.module.scss";

export const SettingsSidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>Cài đặt</div>
      {settingsItems.map((item) => (
        <SettingsSidebarItem key={item.id} item={item} />
      ))}
    </aside>
  );
};
