import React from "react";
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
