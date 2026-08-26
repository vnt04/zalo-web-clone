import { Outlet } from "react-router-dom";
import { SettingsSidebar } from "../../components/sidebars/settings/SettingsSidebar";
import styles from "../../components/settings/index.module.scss";

export const SettingsPage = () => {
  return (
    <div className={styles.settingsLayout}>
      <SettingsSidebar />
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
};
