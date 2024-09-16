import { sepolia, polygonAmoy, artheraTestnet } from './chains';

const DASHBOARD_URL = process.env.REACT_APP_STAGE_DASHBOARD_URL;
const ISSUER_URL = process.env.REACT_APP_STAGE_ISSUER_URL;

const CONFIGURED_URLS = {
  [sepolia.id]: {
    dashboard: DASHBOARD_URL,
    issuer: ISSUER_URL,
  },
  [polygonAmoy.id]: {
    dashboard: DASHBOARD_URL,
    issuer: ISSUER_URL,
  },
  [artheraTestnet.id]: {
    dashboard: DASHBOARD_URL,
    issuer: ISSUER_URL,
  },
};

const DEFAULT_URLS = {
  dashboard: DASHBOARD_URL,
  issuer: ISSUER_URL,
};

export { CONFIGURED_URLS, DEFAULT_URLS };
