'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import profileColors from '@data/profileColors';

interface ProfilePicSelectorProps {
  open: boolean;
  selectedProfilePic: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export default function ProfilePicSelector({
  open,
  selectedProfilePic,
  onSelect,
  onClose,
}: ProfilePicSelectorProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="font-display text-center text-lg font-bold text-surface-900">
        Choose your avatar
      </DialogTitle>
      <DialogContent>
        <div className="grid grid-cols-4 gap-3 p-2">
          {profileColors.map((color, index) => {
            const Icon = color.icon;
            const isSelected = selectedProfilePic === index + 1;
            return (
              <button
                key={index}
                onClick={() => {
                  onSelect(index + 1);
                  onClose();
                }}
                className={`w-14 h-14 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 hover:scale-110 mx-auto ${
                  isSelected
                    ? 'ring-2 ring-primary-500 ring-offset-2'
                    : 'ring-0'
                }`}
                style={{ backgroundColor: color.background }}
              >
                {Icon && <Icon size={24} color="#fff" />}
              </button>
            );
          })}
        </div>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={onClose} variant="outlined" fullWidth>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
