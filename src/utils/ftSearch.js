const redis = require("../redis/index.js");
/**
 * @param {string} name 
 * @param {string} query 
 * @param {number} limit 
 * @returns {{total: number;documents: {id: string; value: {[x: string]: any;};}[];}}
 */
module.exports = async function ftSearch(name, query, limit = 1000) {
  let idx = 0;
  async function t() {
    idx++;
    try {
      return await redis.ft.search(name, query);
    } catch {
      if (idx > limit) return { total: 0, documents: [] };
      return t();
    }
  }
  return await t();
}
