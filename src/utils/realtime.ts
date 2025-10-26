/**
 * Real-time update utilities
 * These functions dispatch custom events that the dashboard listens to
 */

export const triggerDonationUpdate = () => {
  console.log('Triggering donation update event');
  window.dispatchEvent(new CustomEvent('donation-created'));
};

export const triggerDonationStatusUpdate = () => {
  console.log('Triggering donation status update event');
  window.dispatchEvent(new CustomEvent('donation-updated'));
};

export const triggerProjectLike = () => {
  console.log('Triggering project like event');
  window.dispatchEvent(new CustomEvent('project-liked'));
};

export const triggerProjectUnlike = () => {
  console.log('Triggering project unlike event');
  window.dispatchEvent(new CustomEvent('project-unliked'));
};

export const triggerWalletUpdate = () => {
  console.log('Triggering wallet update event');
  window.dispatchEvent(new CustomEvent('wallet-updated'));
};

// Generic function to trigger any custom event
export const triggerCustomEvent = (eventName: string, data?: any) => {
  console.log(`Triggering custom event: ${eventName}`, data);
  window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
};
