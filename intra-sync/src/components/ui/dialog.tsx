import React from "react";

export function Dialog({ open, onOpenChange, children }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        {children}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

export function DialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={"text-lg font-bold mb-2 " + (className || "")}>{children}</h2>;
}

export function DialogDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={"text-sm text-gray-500 mb-4 " + (className || "")}>{children}</div>;
}

export function DialogClose({ children }: { children?: React.ReactNode }) {
  // No-op for compatibility
  return null;
} 