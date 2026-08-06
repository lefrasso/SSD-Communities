import * as React from 'react';
import * as ReactDom from 'react-dom';
import { ThemeProvider } from '@fluentui/react';
import { ssdTheme } from '../../theme/ssdTheme';

export function renderPortal(element: React.ReactElement, domElement: HTMLElement): void {
  ReactDom.render(<ThemeProvider theme={ssdTheme}>{element}</ThemeProvider>, domElement);
}

export function disposePortal(domElement: HTMLElement): void {
  ReactDom.unmountComponentAtNode(domElement);
}