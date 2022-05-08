exports.mlCL = function (paramMsg, paramData) {
    console.log('\r\n=========================================');
    console.log(__filename);
    console.log('-----------------------------------------');
    console.log(paramMsg);
    if (typeof paramData !== "undefined"){
        console.log('-----------------------------------------');
        console.log(paramData);
    }
    console.log('=========================================\r\n'); 
}

exports.groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = obj._phototype_[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {});

exports.e2o = function (data) {
    var result = JSON.parse(JSON.stringify(data));
    return result;
}