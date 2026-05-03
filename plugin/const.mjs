const ENV = import.meta.env;
const SSR = ENV.SSR;
const DEV = ENV.DEV;
const PROD = ENV.PROD;
const MODE = ENV.MODE;
const BASE_URL = ENV.BASE_URL;

export { BASE_URL, DEV, MODE, PROD, SSR };
