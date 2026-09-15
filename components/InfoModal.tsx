"use client";

import { Modal } from "./Modal";

export function InfoModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4 text-sm text-slate-600">{children}</div>
    </Modal>
  );
}
