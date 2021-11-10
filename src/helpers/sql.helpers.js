/**
 * Tekru SQL helpers
 */

module.exports.trimSQLString = function (sql) {
  return sql
    .replace(/\t/g, "")
    .replace(/\n/g, " ")
    .replace(/\s\s+/g, " ")
    .trim();
};
