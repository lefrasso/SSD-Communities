import { createTheme, ITheme } from '@fluentui/react';
import { ssdFluentPalette, ssdFonts } from '../../design-system/theme';

export const ssdTheme: ITheme = createTheme({
  palette: ssdFluentPalette,
  defaultFontStyle: {
    fontFamily: ssdFonts.body,
    fontWeight: ssdFonts.weightRegular
  }
});