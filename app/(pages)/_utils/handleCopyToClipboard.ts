export const handleCopyToClipboard = (
  joinCode: string | undefined,
  setCopySuccess: (message: string | null) => void
) => {
  if (joinCode) {
    navigator.clipboard.writeText(joinCode).then(() => {
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(null), 2000);
    });
  }
};
