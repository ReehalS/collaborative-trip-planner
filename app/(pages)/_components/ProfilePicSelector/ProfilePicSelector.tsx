'use client';

import React from 'react';
import {
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import profileColors from '@data/profileColors';

interface ProfilePicSelectorProps {
  open: boolean; // Controls the visibility of the dialog
  selectedProfilePic: number; // The currently selected profile picture index
  onSelect: (index: number) => void; // Callback for when a profile picture is selected
  onClose: () => void; // Callback for closing the dialog
}

export default function ProfilePicSelector({
  open,
  selectedProfilePic,
  onSelect,
  onClose,
}: ProfilePicSelectorProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Choose Profile Picture</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {profileColors.map((color, index) => {
            const Icon = color.icon;
            return (
              <Grid item xs={3} key={index}>
                <Button
                  fullWidth
                  onClick={() => {
                    onSelect(index + 1);
                    onClose();
                  }}
                  sx={{
                    backgroundColor: color.background,
                    borderRadius: '50%',
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border:
                      selectedProfilePic === index + 1
                        ? '3px solid #000'
                        : 'none',
                    '&:hover': {
                      backgroundColor: color.background,
                    },
                  }}
                >
                  {Icon && <Icon size={24} color="#fff" />}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
