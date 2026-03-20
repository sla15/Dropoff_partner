import React, { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useProfile } from '../context/ProfileContext';
import { useUI } from '../context/UIContext';
import { compareVersions } from '../utils/version';
import { AlertModal } from './AlertModal';

export const VersionCheckModal: React.FC = () => {
    const { appSettings, isLoading } = useProfile();
    const { isDarkMode } = useUI();
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isMandatory, setIsMandatory] = useState(false);
    const [updateUrl, setUpdateUrl] = useState('');

    useEffect(() => {
        const checkVersion = async () => {
            if (isLoading) return;

            try {
                // Get current app version
                const info = await App.getInfo();
                const currentVersion = info.version;
                
                const { 
                    min_partner_app_version, 
                    latest_partner_app_version, 
                    update_url_partner_android, 
                    update_url_partner_ios 
                } = appSettings;

                const platform = Capacitor.getPlatform();
                const storeUrl = platform === 'ios' ? update_url_partner_ios : update_url_partner_android;
                setUpdateUrl(storeUrl);

                // Check for mandatory update
                if (min_partner_app_version && compareVersions(currentVersion, min_partner_app_version) === -1) {
                    setIsMandatory(true);
                    setShowUpdateModal(true);
                    return;
                }

                // Check for optional update
                if (latest_partner_app_version && compareVersions(currentVersion, latest_partner_app_version) === -1) {
                    setIsMandatory(false);
                    setShowUpdateModal(true);
                }
            } catch (error) {
                console.error('Error checking app version:', error);
            }
        };

        checkVersion();
    }, [isLoading, appSettings]);

    const handleUpdate = () => {
        if (updateUrl) {
            window.open(updateUrl, '_system');
        }
    };

    if (!showUpdateModal) return null;

    return (
        <AlertModal
            isOpen={showUpdateModal}
            title={isMandatory ? 'Mandatory Update' : 'Update Available'}
            message={
                isMandatory 
                ? 'A new version of the Partner app is required to continue. Please update now.' 
                : 'A new version of the Partner app is available with improvements and bug fixes.'
            }
            onClose={() => !isMandatory && setShowUpdateModal(false)}
            onConfirm={handleUpdate}
            confirmText="Update Now"
            cancelText={isMandatory ? undefined : 'Later'}
            onCancel={() => setShowUpdateModal(false)}
            isDarkMode={isDarkMode}
        />
    );
};
