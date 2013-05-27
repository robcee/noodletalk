/* Generic db keys content retriever
 * Requires: db client connection, key name, channel, message limit
 * Returns: data list if found
 */
exports.getDataByKeys = function(client, keyName, channel, callback) {
  client.keys(keyName + ':' + channel + ':*', function(err, dataItems) {
    if (err) {
      return callback(err);
    } else {
      try {
        var dataList = [];

        if (dataItems.length > 0) {
          dataItems.forEach(function(dataItem) {
            client.get(dataItem, function(errDataItem, dataHash) {
              if (errDataItem) {
                return callback(errDataItem);
              }

              dataList.unshift(JSON.parse(dataHash));

              if (dataList.length === dataItems.length) {
                callback(null, dataList);
              }
            });
          });
        } else {
          callback(null, dataList);
        }
      } catch (dataErr) {
        callback(dataErr);
      }
    }
  });
};

/* Generic db list content retriever
 * Requires: db client connection, key name, channel, message limit
 * Returns: data list if found
 */
exports.getDataByList = function(client, keyName, channel, recentLimit, callback) {
  client.lrange(keyName + ':' + channel, 0, recentLimit + 1, function(err, dataItems) {
    if (err) {
      callback(err);
    } else {
      try {
        var dataList = [];

        if (dataItems.length > 0) {
          dataItems.forEach(function(dataItem) {
            dataList.unshift(JSON.parse(dataItem));

            if (dataList.length === dataItems.length) {
              callback(null, dataList);
            }
          });
        } else {
          callback(null, dataList);
        }
      } catch (dataErr) {
        callback(dataErr);
      }
    }
  });
};
