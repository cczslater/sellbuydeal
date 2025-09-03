
'use client';
import { supabase } from './supabase';

export interface AdminSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentSettings {
  paypal: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    merchantId: string;
    environment: 'sandbox' | 'production';
    webhookUrl: string;
  };
  googlePay: {
    enabled: boolean;
    merchantId: string;
    merchantName: string;
    environment: 'TEST' | 'PRODUCTION';
    allowedCardNetworks: string[];
    allowedCardAuthMethods: string[];
  };
  bitcoin: {
    enabled: boolean;
    walletAddress: string;
    network: 'mainnet' | 'testnet';
    provider: string;
    apiKey: string;
    webhookUrl: string;
    confirmations: number;
  };
  stripe: {
    enabled: boolean;
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    currency: string;
  };
}

export interface WebsiteSettings {
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  accentColor: string;
  commissionRate: number;
  featuredListingFee: number;
  videoUploadFee: number;
  maintenanceMode: boolean;
  allowGuestBrowsing: boolean;
  requireEmailVerification: boolean;
  autoApproveListings: boolean;
}

export const getAdminSetting = async (key: string): Promise<AdminSetting | null> => {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .eq('setting_key', key)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching admin setting:', error);
    return null;
  }

  return data;
};

export const updateAdminSetting = async (
  key: string,
  value: any,
  type: AdminSetting['setting_type'] = 'string',
  category: string = 'general',
  description: string = ''
): Promise<boolean> => {
  const settingValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

  const { error } = await supabase
    .from('admin_settings')
    .upsert({
      setting_key: key,
      setting_value: settingValue,
      setting_type: type,
      category: category,
      description: description,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'setting_key'
    });

  if (error) {
    console.error('Error updating admin setting:', error);
    return false;
  }

  return true;
};

export const getPaymentSettings = async (): Promise<PaymentSettings> => {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .eq('category', 'payment');

  if (error) {
    console.error('Error fetching payment settings:', error);
    return getDefaultPaymentSettings();
  }

  const settings = getDefaultPaymentSettings();
  
  if (data && data.length > 0) {
    data.forEach(setting => {
      const keys = setting.setting_key.split('.');
      if (keys.length === 2) {
        const [provider, field] = keys;
        if (settings[provider as keyof PaymentSettings]) {
          let value = setting.setting_value;
          
          // Parse value based on type
          if (setting.setting_type === 'boolean') {
            value = value === 'true';
          } else if (setting.setting_type === 'number') {
            value = parseFloat(value);
          } else if (setting.setting_type === 'json') {
            try {
              value = JSON.parse(value);
            } catch (e) {
              console.error('Error parsing JSON setting:', e);
            }
          }
          
          (settings[provider as keyof PaymentSettings] as any)[field] = value;
        }
      }
    });
  }

  return settings;
};

export const updatePaymentSettings = async (settings: PaymentSettings): Promise<boolean> => {
  try {
    const updates = [];

    // Flatten settings for storage
    Object.entries(settings).forEach(([provider, providerSettings]) => {
      Object.entries(providerSettings).forEach(([field, value]) => {
        const key = `${provider}.${field}`;
        let type: AdminSetting['setting_type'] = 'string';
        
        if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'object') {
          type = 'json';
        }

        updates.push({
          setting_key: key,
          setting_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
          setting_type: type,
          category: 'payment',
          description: `${provider} ${field} setting`,
          updated_at: new Date().toISOString()
        });
      });
    });

    const { error } = await supabase
      .from('admin_settings')
      .upsert(updates, {
        onConflict: 'setting_key'
      });

    if (error) {
      console.error('Error updating payment settings:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updatePaymentSettings:', error);
    return false;
  }
};

export const getWebsiteSettings = async (): Promise<WebsiteSettings> => {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .eq('category', 'website');

  if (error) {
    console.error('Error fetching website settings:', error);
    return getDefaultWebsiteSettings();
  }

  const settings = getDefaultWebsiteSettings();
  
  if (data && data.length > 0) {
    data.forEach(setting => {
      const key = setting.setting_key as keyof WebsiteSettings;
      if (key in settings) {
        let value = setting.setting_value;
        
        // Parse value based on type
        if (setting.setting_type === 'boolean') {
          value = value === 'true';
        } else if (setting.setting_type === 'number') {
          value = parseFloat(value);
        }
        
        (settings[key] as any) = value;
      }
    });
  }

  return settings;
};

export const updateWebsiteSettings = async (settings: WebsiteSettings): Promise<boolean> => {
  try {
    const updates = [];

    Object.entries(settings).forEach(([field, value]) => {
      let type: AdminSetting['setting_type'] = 'string';
      
      if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (typeof value === 'number') {
        type = 'number';
      }

      updates.push({
        setting_key: field,
        setting_value: String(value),
        setting_type: type,
        category: 'website',
        description: `Website ${field} setting`,
        updated_at: new Date().toISOString()
      });
    });

    const { error } = await supabase
      .from('admin_settings')
      .upsert(updates, {
        onConflict: 'setting_key'
      });

    if (error) {
      console.error('Error updating website settings:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateWebsiteSettings:', error);
    return false;
  }
};

export const getDefaultPaymentSettings = (): PaymentSettings => ({
  paypal: {
    enabled: false,
    clientId: '',
    clientSecret: '',
    merchantId: '',
    environment: 'sandbox',
    webhookUrl: ''
  },
  googlePay: {
    enabled: false,
    merchantId: '',
    merchantName: '',
    environment: 'TEST',
    allowedCardNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
    allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS']
  },
  bitcoin: {
    enabled: false,
    walletAddress: '',
    network: 'mainnet',
    provider: 'blockchain_info',
    apiKey: '',
    webhookUrl: '',
    confirmations: 3
  },
  stripe: {
    enabled: true,
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    currency: 'USD'
  }
});

export const getDefaultWebsiteSettings = (): WebsiteSettings => ({
  siteName: 'MarketPlace Hub',
  siteDescription: 'Buy and sell anything online with our secure marketplace platform',
  primaryColor: '#004080',
  accentColor: '#FFA500',
  commissionRate: 5,
  featuredListingFee: 2.99,
  videoUploadFee: 2.99,
  maintenanceMode: false,
  allowGuestBrowsing: true,
  requireEmailVerification: true,
  autoApproveListings: false
});

export const getAllAdminSettings = async (): Promise<AdminSetting[]> => {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .order('category', { ascending: true })
    .order('setting_key', { ascending: true });

  if (error) {
    console.error('Error fetching all admin settings:', error);
    return [];
  }

  return data || [];
};

export const deleteAdminSetting = async (key: string): Promise<boolean> => {
  const { error } = await supabase
    .from('admin_settings')
    .delete()
    .eq('setting_key', key);

  if (error) {
    console.error('Error deleting admin setting:', error);
    return false;
  }

  return true;
};

export const testPaymentProvider = async (provider: string, settings: any): Promise<boolean> => {
  // This would implement actual testing logic for each provider
  console.log(`Testing ${provider} with settings:`, settings);
  
  // Simulate testing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // For demo purposes, always return success
  // In real implementation, this would make actual API calls to test connectivity
  return true;
};
