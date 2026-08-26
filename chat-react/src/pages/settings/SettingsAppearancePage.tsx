import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { setTheme } from "../../store/settings/settingsSlice";
import { SelectableTheme } from "../../utils/types";
import styles from "../../components/settings/index.module.scss";

const THEMES: { value: SelectableTheme; label: string; swatch: string }[] = [
  { value: "light", label: "Sáng", swatch: styles.themeSwatchLight },
  { value: "dark", label: "Tối", swatch: styles.themeSwatchDark },
];

export const SettingsAppearancePage = () => {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state: RootState) => state.settings.theme);

  const handleThemeChange = (theme: SelectableTheme) => {
    dispatch(setTheme(theme));
    localStorage.setItem("theme", theme);
  };

  return (
    <div className={styles.themeList}>
      {THEMES.map((theme) => (
        <button
          type="button"
          key={theme.value}
          className={classNames(styles.themeOption, {
            [styles.themeOptionActive]: currentTheme === theme.value,
          })}
          onClick={() => handleThemeChange(theme.value)}
        >
          <span className={classNames(styles.themeSwatch, theme.swatch)} />
          {theme.label}
        </button>
      ))}
    </div>
  );
};
