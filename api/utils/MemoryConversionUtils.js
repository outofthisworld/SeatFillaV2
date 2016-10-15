/*
    A utility class for converting between secondary storage units.

    Created by Dale.
*/

module.exports = {
  bytesToKB(bytes) {
    return bytes / 1024
  },
  bytesToMB(bytes) {
    return bytes / Math.pow(1024, 2)
  },
  bytesToGB(bytes) {
    return bytes / Math.pow(1024, 3)
  },
  bytesToTB(bytes) {
    return bytes / Math.pow(1024, 4)
  },
  bytesToPB(bytes) {
    return bytes / Math.pow(1024, 5)
  },
  bytesToEB(bytes) {
    return bytes / Math.pow(1024, 6)
  },
  bytesToZB(bytes) {
    return bytes / Math.pow(1024, 7)
  },
  killobytesToB(kb) {
    return kb * 1024
  },
  killobytesToMB(kb) {
    return kb / 1024
  },
  killobytesToGB(kb) {
    return kb / Math.pow(1024, 2)
  },
  killobytesToTB(kb) {
    return kb / Math.pow(1024, 3)
  },
  killobytesToPB(kb) {
    return kb / Math.pow(1024, 4)
  },
  killobytesToEB(kb) {
    return kb / Math.pow(1024, 5)
  },
  killobytesToZB(kb) {
    return kb / Math.pow(1024, 6)
  },
  megabytesToB(mb) {
    return mb * Math.pow(1024, 2)
  },
  megabytesToKB(mb) {
    return mb * 1024
  },
  megabytesToGB(mb) {
    return mb / 1024
  },
  megabytesToTB(mb) {
    return mb / Math.pow(1024, 2)
  },
  megabytesToPB(mb) {
    return mb / Math.pow(1024, 3)
  },
  megabytesToEB(mb) {
    return mb / Math.pow(1024, 4)
  },
  megabytesToZB(mb) {
    return mb / Math.pow(1024, 5)
  },
  gigabytesToB(g) {
    return g * Math.pow(1024, 3)
  },
  gigabytesToKB(g) {
    return g * Math.pow(1024, 2)
  },
  gigabytesToMB(g) {
    return g * 1024
  },
  gigabytesToTB(g) {
    return g / 1024
  },
  gigabytesToPB(g) {
    return g / Math.pow(1024, 2)
  },
  gigabytesToEB(g) {
    return g / Math.pow(1024, 3)
  },
  gigabytesToZB(g) {
    return g / Math.pow(1024, 4)
  },
  terabytesToB(tb) {
    return tb * Math.pow(1024, 4)
  },
  terabytesToKB(tb) {
    return tb * Math.pow(1024, 3)
  },
  terabytesToMB(tb) {
    return tb * Math.pow(1024, 2)
  },
  terabytesToGB(tb) {
    return tb * 1024
  },
  terabytesToPB(tb) {
    return tb / 1024
  },
  terabytesToEB(tb) {
    return tb / Math.pow(1024, 2)
  },
  terabytesToZB(tb) {
    return tb / Math.pow(1024, 3)
  },
  createMemoryUnit(value) {
    const _self = this

    if (!value) value = 0

    function to (type) {
      return this['to' + type]()
    }

    function convert (toMemoryUnit) {
      return this.to(toMemoryUnit.type)
    }

    function getValue () {
      return this.value
    }

    function setValue (amount) {
      this.value = amount
      return this
    }

    return {
      Bytes: {
        value,
        type: 'Bytes',
        convert,
        to,
        getValue,
        setValue,
        toString() { return value + ' Bytes(s)'; },
        toBytes() {
          return this
        },
        toKB() {
          return _self.createMemoryUnit(_self.bytesToKB(value)).Killobytes
        },
        toMB() {
          return _self.createMemoryUnit(_self.bytesToMB(value)).Megabytes
        },
        toGB() {
          return _self.createMemoryUnit(_self.bytesToGB(value)).Gigabytes
        },
        toTB() {
          return _self.createMemoryUnit(_self.bytesToTB(value)).Terabytes
        }
      },
      Killobytes: {
        value,
        convert,
        to,
        getValue,
        setValue,
        type: 'Killobytes',
        toString() { return value + ' Killobytes(s)'; },
        toBytes() {
          return _self.createMemoryUnit(_self.killobytesToB(value)).Bytes
        },
        toKB() {
          return this
        },
        toMB() {
          return _self.createMemoryUnit(_self.killobytesToMB(value)).Megabytes
        },
        toGB() {
          return _self.createMemoryUnit(_self.killobytesToGB(value)).Gigabytes
        },
        toTB() {
          return _self.createMemoryUnit(_self.killobytesToTB(value)).Terabytes
        }
      },
      Megabytes: {
        value,
        type: 'Megabytes',
        convert,
        to,
        getValue,
        setValue,
        toString() { return valuet + ' Megabytes(s)'; },
        toBytes() {
          return _self.createMemoryUnit(_self.megabytesToB(value)).Bytes
        },
        toKB() {
          return _self.createMemoryUnit(_self.megabytesToKB(value)).Killobytes
        },
        toMB() {
          return this
        },
        toGB() {
          return _self.createMemoryUnit(_self.megabytesToGB(value)).Gigabytes
        },
        toTB() {
          return _self.createMemoryUnit(_self.megabytesToTB(value)).Terabytes
        }
      },
      Gigabytes: {
        value,
        type: 'Gigabytes',
        convert,
        to,
        getValue,
        setValue,
        toString() { return value + ' Gigabytes(s)'; },
        toBytes() {
          return _self.createMemoryUnit(_self.gigabytesToB(value)).Bytes
        },
        toKB() {
          return _self.createMemoryUnit(_self.gigabytesToKB(value)).Killobytes
        },
        toMB() {
          return _self.createMemoryUnit(_self.gigabytesToMB(value)).Megabytes
        },
        toGB() {
          return this
        },
        toTB() {
          return _self.createMemoryUnit(_self.gigabytesToTB(value)).Terabytes
        }
      },
      Terabytes: {
        value,
        type: 'Terabytes',
        convert,
        to,
        getValue,
        setValue,
        toString() { return value + ' Terabytes(s)'; },
        toBytes() {
          return _self.createMemoryUnit(_self.terabytesToB(value)).Bytes
        },
        toKB() {
          return _self.createMemoryUnit(_self.terabytesToKB(value)).Killobytes
        },
        toMB() {
          return _self.createMemoryUnit(_self.terabytesToMB(value)).Megabytes
        },
        toGB() {
          return _self.createMemoryUnit(_self.terabytesToGB(value)).Gigabytes
        },
        toTB() {
          return this
        }
      }
    }
  }
}
