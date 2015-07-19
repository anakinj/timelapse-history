module.exports = function(orm, db) {
  db.define('file', {
    tag: {
      type: "text",
      size: 50
    },
    path: {
      type: "text",
      size: 256
    },
    created: {
      type: "date",
      time: true
    }
  });
};
