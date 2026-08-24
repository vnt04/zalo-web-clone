import React from "react";
import { AiOutlineSearch } from "react-icons/ai";
import styles from "./index.module.scss";
import classNames from "classnames";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={classNames(styles.searchInput, className)}
        {...props}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";

// Ô tìm kiếm của Zalo có kính lúp nằm trong ô, nền xám và chuyển sang nền trắng
// viền xanh khi focus.
export const SearchBox = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={styles.searchBox}>
        <AiOutlineSearch className={styles.searchIcon} size={16} />
        <SearchInput ref={ref} className={className} {...props} />
      </div>
    );
  }
);

SearchBox.displayName = "SearchBox";
