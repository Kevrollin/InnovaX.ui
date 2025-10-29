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

export const triggerProjectLike = (projectId?: string) => {
  console.log('Triggering project like event', projectId);
  window.dispatchEvent(new CustomEvent('project-liked', { detail: { projectId } }));
};

export const triggerProjectUnlike = (projectId?: string) => {
  console.log('Triggering project unlike event', projectId);
  window.dispatchEvent(new CustomEvent('project-unliked', { detail: { projectId } }));
};

export const triggerProjectShare = (projectId?: string) => {
  console.log('Triggering project share event', projectId);
  window.dispatchEvent(new CustomEvent('project-shared', { detail: { projectId } }));
};

export const triggerProjectView = (projectId?: string) => {
  console.log('Triggering project view event', projectId);
  window.dispatchEvent(new CustomEvent('project-viewed', { detail: { projectId } }));
};

export const triggerWalletUpdate = () => {
  console.log('Triggering wallet update event');
  window.dispatchEvent(new CustomEvent('wallet-updated'));
};

export const triggerProjectUpdate = (projectId?: string) => {
  console.log('Triggering project update event', projectId);
  window.dispatchEvent(new CustomEvent('project-updated', { detail: { projectId } }));
};

export const triggerProjectStatusChange = (projectId?: string, status?: string) => {
  console.log('Triggering project status change event', projectId, status);
  window.dispatchEvent(new CustomEvent('project-status-changed', { detail: { projectId, status } }));
};

// Generic function to trigger any custom event
export const triggerCustomEvent = (eventName: string, data?: any) => {
  console.log(`Triggering custom event: ${eventName}`, data);
  window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
};
