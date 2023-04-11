import { polygonMumbai } from 'wagmi/chains';

const STAGE_DASHBOARD_URL = process.env.REACT_APP_STAGE_DASHBOARD_URL;
const STAGE_ISSUER_URL = process.env.REACT_APP_STAGE_ISSUER_URL;

const CONFIGURED_URLS = {
  [polygonMumbai.id]: {
    dashboard: STAGE_DASHBOARD_URL,
    issuer: STAGE_ISSUER_URL,
  },
  },
};

const DEFAULT_URLS = {
  dashboard: STAGE_DASHBOARD_URL,
  issuer: STAGE_ISSUER_URL,
};

export { CONFIGURED_URLS, DEFAULT_URLS };
