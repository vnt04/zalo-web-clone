import React from "react";
import classNames from "classnames";
import styles from "./index.module.scss";

interface MessagePanelStyleProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const MessagePanelStyle: React.FC<MessagePanelStyleProps> = ({
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

interface MessagePanelHeaderStyleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const MessagePanelHeaderStyle: React.FC<
  MessagePanelHeaderStyleProps
> = ({ className, children, ...rest }) => {
  return (
    <div className={classNames(styles.messagePanelHeader, className)} {...rest}>
      {children}
    </div>
  );
};

interface MessagePanelBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const MessagePanelBody: React.FC<MessagePanelBodyProps> = ({
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

interface MessageContainerStyleProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const MessageContainerStyle: React.FC<MessageContainerStyleProps> = ({
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

interface MessageItemDetailsProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const MessageItemDetails: React.FC<MessageItemDetailsProps> = ({
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

interface MessageItemHeaderContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

export const MessageItemHeaderContainer: React.FC<
  MessageItemHeaderContainerProps
> = ({ className, children, ...rest }) => {
  return (
    <div
      className={classNames(styles.messageItemHeaderContainer, className)}
      {...rest}
    >
      {children}
    </div>
  );
};

interface MessageItemContentProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  padding?: string;
  children: React.ReactNode;
}

export const MessageItemContent: React.FC<MessageItemContentProps> = ({
  className,
  padding,
  children,
  ...rest
}) => {
  return (
    <div
      className={classNames(styles.messageItemContent, className)}
      style={{ padding }}
      {...rest}
    >
      {children}
    </div>
  );
};

interface MessagePanelFooterProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  children: React.ReactNode;
}

export const MessagePanelFooter: React.FC<MessagePanelFooterProps> = ({
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
