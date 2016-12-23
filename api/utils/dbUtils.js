module.exports = {
  extractModelAttributes(model, object) {
    var ret = []
    if (Array.isArray(object)) {
      object.forEach(function (obj) {
        var tmp = {}
        Object.keys(model._attributes).forEach(function (attr) {
          if(attr == 'createdAt' || attr == 'updatedAt') return;
          if(obj[attr]) tmp[attr] = obj[attr]
        })
        ret.push(tmp)
      })
    }else {
      ret = {}
      Object.keys(model._attributes).forEach(function (key) {
        if(object[key])
          ret[key] = object[key]
      })
    }

    return ret
  }
}
