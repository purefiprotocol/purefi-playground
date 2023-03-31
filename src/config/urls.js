import { polygonMumbai } from 'wagmi/chains';

const CONFIGURED_URLS = {
  [polygonMumbai.id]: {
    dashboard: 'https://stage.dashboard.purefi.io',
    issuer: 'https://stage.issuer.app.purefi.io',
  },
};

const DEFAULT_URLS = {
  dashboard: 'https://stage.dashboard.purefi.io',
  issuer: 'https://stage.issuer.app.purefi.io',
};

export { CONFIGURED_URLS, DEFAULT_URLS };
