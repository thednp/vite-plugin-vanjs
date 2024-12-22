const { dummyVanX } = require("mini-van-plate/shared");
const vanPlate = require("mini-van-plate/van-plate");
const vanCore = require("vanjs-core");
const vanX = require("vanjs-ext");

module.exports = {
  get isServer () { return typeof window === "undefined" },
  get van () { return this.isServer ? vanPlate : vanCore },
  get vanX () { return this.isServer ? dummyVanX : vanX },
};