'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-[#090909] border border-[#1A1A1A] rounded-2xl p-6 shadow-2xl z-10 overflow-hidden pointer-events-auto"
          >
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#71717A] to-transparent opacity-50" />
            
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-[#71717A] mb-6 leading-relaxed">
              {message}
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={onCancel}
                className="h-9 hover:bg-[#1A1A1A] text-[#71717A] hover:text-white border border-transparent rounded-lg px-4 transition-all duration-200"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                className="h-9 bg-white hover:bg-neutral-200 text-black font-semibold px-4 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
