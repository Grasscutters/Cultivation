/**
 * 'close_action': 0 = close, 1 = tray
 */
export interface Configuration {
  toggle_grasscutter: boolean;
  game_install_path: string;
  grasscutter_with_game: boolean;
  grasscutter_path: string;
  java_path: string;
  close_action: number;
  startup_launch: boolean;
  last_ip: string;
  last_port: string;
  language: string;
  customBackground: string;
  cert_generated: boolean;
  theme: string;
  https_enabled: boolean;
  debug_enabled: boolean;
  patch_metadata: boolean;
  use_internal_proxy: boolean;
  wipe_login: boolean;
  horny_mode: boolean;
  swag_mode?: boolean;

  // Swag stuff
  akebi_path?: string;
  migoto_path?: string;
  reshade_path?: string;
  last_extras?: {
    migoto: boolean;
    akebi: boolean;
    reshade: boolean;
  };
}
