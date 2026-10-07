"use client";

import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";

/**
 * Mobile navigation built on the native `<dialog>` element.
 *
 * Focus trapping, Escape to close and an inert background come from the
 * platform. The only script here opens and closes the dialog and returns focus
 * to the trigger — the three behaviours a `<dialog>` does not do for free when
 * driven by a button outside it.
 */
export function MobileNav({
  openLabel,
  closeLabel,
  children,
}: {
  openLabel: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const open = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    const onClose = () => {
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  return (
    <div className="flex items-center md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={open}
        className={
          "text-current rounded-md px-3 py-2 text-sm font-medium " +
          "focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2"
        }
        aria-haspopup="dialog"
      >
        {openLabel}
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className={
          "bg-surface text-text m-0 ml-auto h-dvh max-h-dvh w-[min(100%,20rem)] " +
          "max-w-full border-0 p-0 shadow-lg backdrop:bg-text/40 open:flex open:flex-col"
        }
        onClick={(event) => {
          // A click on the backdrop (the dialog itself, not its children) closes.
          if (event.target === dialogRef.current) close();
        }}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id={titleId} className="text-base font-medium">
            {openLabel}
          </h2>
          <button
            type="button"
            onClick={close}
            className={
              "text-text-muted hover:text-text rounded-md px-3 py-2 text-sm " +
              "focus-visible:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2"
            }
          >
            {closeLabel}
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-4" onClick={close}>
          {children}
        </nav>
      </dialog>
    </div>
  );
}
