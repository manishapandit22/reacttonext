import React, { useEffect, useState } from 'react';

interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

interface ConnectionInfo {
  type: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface DeviceInfo {
  isMobile: boolean;
  deviceType: string;
  browserName: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  vendor: string;
  screenResolution: string;
  devicePixelRatio: number;
  touchSupport: boolean;
  orientation: string | number;
  connection: ConnectionInfo | null;
  battery: BatteryInfo | null;
  ram: number | null;
}

interface NavigatorWithExtensions extends Navigator {
  getBattery?: () => Promise<any>;
  connection?: any;
  mozConnection?: any;
  webkitConnection?: any;
  deviceMemory?: number;
}

const useDeviceDetect = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    deviceType: '',
    browserName: '',
    browserVersion: '',
    os: '',
    osVersion: '',
    vendor: '',
    screenResolution: '',
    devicePixelRatio: 1,
    touchSupport: false,
    orientation: '',
    connection: null,
    battery: null,
    ram: null
  });

  useEffect(() => {
    const detectDevice = async () => {
      if (typeof window !== 'undefined') {

        const userAgent = window.navigator.userAgent;
        const platform = window.navigator.platform;
        
        const browserInfo = {
          chrome: /chrome/i.test(userAgent),
          safari: /safari/i.test(userAgent),
          firefox: /firefox/i.test(userAgent),
          opera: /opera/i.test(userAgent),
          ie: /msie/i.test(userAgent),
          edge: /edge/i.test(userAgent),
        };

        const browserName = Object.keys(browserInfo).find(key => (browserInfo as any)[key]) || 'unknown';
        const browserVersion = userAgent.match(/(chrome|safari|firefox|opera|msie|edge)\/?\s*(\.?\d+(\.\d+)*)/i)?.[2] || '';

        const os = {
          windows: /windows/i.test(platform),
          mac: /mac/i.test(platform),
          linux: /linux/i.test(platform),
          ios: /iphone|ipad|ipod/i.test(userAgent),
          android: /android/i.test(userAgent)
        };

        const osName = Object.keys(os).find(key => (os as any)[key]) || 'unknown';
        const osVersion = userAgent.match(/(?:windows nt|mac os x|android) ([._\d]+)/i)?.[1] || '';

        const isMobile = /Mobile|Android|iP(hone|od|ad)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent);
        const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent);
        const deviceType = isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop');

        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        
        const touchSupport = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        const orientation = (screen as any).orientation?.type || (window as any).orientation;
        
        const nav = navigator as NavigatorWithExtensions;
        const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

        let battery = null;
        try {
          const batteryManager = await nav.getBattery?.();
          battery = batteryManager;
        } catch (e) {
          console.warn('Battery status not available');
        }

        const ram = nav.deviceMemory || null;

        setDeviceInfo({
          isMobile,
          deviceType,
          browserName,
          browserVersion,
          os: osName,
          osVersion,
          vendor: navigator.vendor,
          screenResolution,
          devicePixelRatio: window.devicePixelRatio,
          touchSupport,
          orientation,
          connection: connection ? {
            type: connection.effectiveType,
            downlink: connection.downlink,
            rtt: connection.rtt,
            saveData: connection.saveData
          } : null,
          battery: battery ? {
            level: battery.level,
            charging: battery.charging,
            chargingTime: battery.chargingTime,
            dischargingTime: battery.dischargingTime
          } : null,
          ram
        });
      }
    };

    detectDevice();

    const handleOrientationChange = () => {
      setDeviceInfo(prev => ({
        ...prev,
        orientation: (screen as any).orientation?.type || (window as any).orientation
      }));
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
};

export default useDeviceDetect;

