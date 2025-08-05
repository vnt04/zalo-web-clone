import React from "react";
import classNames from "classnames";
import styles from "./index.module.scss";

interface CommonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const MessagePanelStyle: React.FC<CommonProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div className={classNames(styles.messagePanel, className)} {...rest}>
      {children}
    </div>
  );
};

export const MessagePanelHeaderStyle: React.FC<CommonProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div className={classNames(styles.messagePanelHeader, className)} {...rest}>
      {children}
    </div>
  );
};

export const MessagePanelBody: React.FC<CommonProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div className={classNames(styles.messagePanelBody, className)} {...rest}>
      {children}
    </div>
  );
};

export const MessageContainerStyle: React.FC<CommonProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div
      className={classNames(styles.messageContainerStyle, className)}
      {...rest}
    >
      {children}
    </div>
  );
};

interface MessageItemContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isOwnerMessage: boolean;
  className?: string;
  children: React.ReactNode;
}

export const MessageItemContainer: React.FC<MessageItemContainerProps> = ({
  className,
  isOwnerMessage = false,
  children,
  ...rest
}) => {
  return (
    <div
      className={classNames(
        styles.messageItemContainer,
        {
          [styles.isOwnerMessage]: isOwnerMessage,
        },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export const MessageItemDetails: React.FC<CommonProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div className={classNames(styles.messageItemDetail, className)} {...rest}>
      {children}
    </div>
  );
};

export const MessageItemHeaderContainer: React.FC<CommonProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div
      className={classNames(styles.messageItemHeaderContainer, className)}
      {...rest}
    >
      {children}
    </div>
  );
};

export const MessageTypingStatus: React.FC<CommonProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div
      className={classNames(styles.messageTypingStatus, className)}
      {...rest}
    >
      {children}
    </div>
  );
};

export const MessageInputHeader: React.FC<CommonProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div className={classNames(styles.messageInputHeader, className)} {...rest}>
      {children}
    </div>
  );
};

export const MessageInputBody: React.FC<CommonProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <div className={classNames(styles.messageInputBody, className)} {...rest}>
      {children}
    </div>
  );
};

interface MessageItemContentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOwnerMessage: boolean;
  className?: string;
  children: React.ReactNode;
}

export const MessageItemContent: React.FC<MessageItemContentProps> = ({
  isOwnerMessage = false,
  className,
  children,
  ...rest
}) => {
  return (
    <div
      className={classNames(
        styles.messageItemContent,
        {
          [styles.isOwnerMessage]: isOwnerMessage,
        },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export const MessagePanelFooter: React.FC<CommonProps> = ({
  className,
  children,
  ...rest
}) => {
  return (
    <footer
      className={classNames(styles.messagePanelFooter, className)}
      {...rest}
    >
      {children}
    </footer>
  );
};

interface MessageInputContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  isMultiLine: boolean;
  children: React.ReactNode;
}

export const MessageInputContainer: React.FC<MessageInputContainerProps> = ({
  className,
  children,
  isMultiLine,
  ...rest
}) => {
  return (
    <div
      className={classNames(
        styles.messageInputContainer,
        { [styles.isMultiLine]: isMultiLine },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

interface MessageTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const MessageTextarea = React.forwardRef<
  HTMLTextAreaElement,
  MessageTextareaProps
>(({ className, ...rest }, ref) => {
  return (
    <textarea
      ref={ref}
      className={classNames(styles.messageTextarea, className)}
      {...rest}
    />
  );
});

MessageTextarea.displayName = "MessageTextarea";
