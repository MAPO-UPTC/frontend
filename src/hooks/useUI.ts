import { useCallback } from 'react';
import { useMAPOStore } from '../store';
import { Notification } from '../types';

export const useUI = () => {
  const {
    ui,
    addNotification,
    removeNotification,
    setLoading,
    toggleModal
  } = useMAPOStore();

  const showNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string
  ) => {
    addNotification({ type, title, message });
  }, [addNotification]);

  const showSuccess = useCallback((title: string, message: string) => {
    showNotification('success', title, message);
  }, [showNotification]);

  const showError = useCallback((title: string, message: string) => {
    showNotification('error', title, message);
  }, [showNotification]);

  const showWarning = useCallback((title: string, message: string) => {
    showNotification('warning', title, message);
  }, [showNotification]);

  const showInfo = useCallback((title: string, message: string) => {
    showNotification('info', title, message);
  }, [showNotification]);

  const dismissNotification = useCallback((id: string) => {
    removeNotification(id);
  }, [removeNotification]);

  const setComponentLoading = useCallback((component: string, loading: boolean) => {
    setLoading(component, loading);
  }, [setLoading]);

  const isComponentLoading = useCallback((component: string) => {
    return ui.loading[component] || false;
  }, [ui.loading]);

  const openModal = useCallback((modal: keyof typeof ui.modals) => {
    if (!ui.modals[modal]) {
      toggleModal(modal);
    }
  }, [ui, toggleModal]);

  const closeModal = useCallback((modal: keyof typeof ui.modals) => {
    if (ui.modals[modal]) {
      toggleModal(modal);
    }
  }, [ui, toggleModal]);

  const isModalOpen = useCallback((modal: keyof typeof ui.modals) => {
    return ui.modals[modal];
  }, [ui]);

  const clearAllNotifications = useCallback(() => {
    ui.notifications.forEach(notification => {
      removeNotification(notification.id);
    });
  }, [ui.notifications, removeNotification]);

  return {
    // State
    notifications: ui.notifications,
    modals: ui.modals,
    loading: ui.loading,
    
    // Notification actions
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismissNotification,
    clearAllNotifications,
    
    // Loading actions
    setComponentLoading,
    isComponentLoading,
    
    // Modal actions
    openModal,
    closeModal,
    isModalOpen,
    toggleModal,
  };
};