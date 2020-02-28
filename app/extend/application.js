'use strict';
const CREATE = 'https://apis.map.qq.com/place_cloud/data/create';
const UPDATE = 'https://apis.map.qq.com/place_cloud/data/update';
const DELETE = 'https://apis.map.qq.com/place_cloud/data/delete';
const TRANSLATE = 'https://apis.map.qq.com/ws/coord/v1/translate';
const IP = 'https://apis.map.qq.com/ws/location/v1/ip ';
const GEOCODER = 'https://apis.map.qq.com/ws/geocoder/v1/';

module.exports = {
  /**
   * 创建定位
   * @param {*} id id
   * @param {*} title 标题
   * @param {*} longitude 经度
   * @param {*} latitude 纬度
   */
  async lbs_create(id, title, longitude, latitude) {
    const { data } = await this.curl(CREATE, {
      dataType: 'json',
      contentType: 'json',
      method: 'POST',
      data: {
        key: this.config.lbs.key,
        table_id: this.config.lbs.table_id,
        data: [
          {
            ud_id: String(id),
            title,
            location: {
              lat: parseFloat(latitude),
              lng: parseFloat(longitude),
            },
          },
        ],
      },
    });

    if (data.status !== 0) {
      throw new Error(`创建失败，错误信息：${data.message}`);
    }
  },

  /**
   * 更新定位
   * @param {*} id id
   * @param {*} title 标题
   * @param {*} longitude 经度
   * @param {*} latitude 纬度
   */
  async lbs_update(id, title, longitude, latitude) {
    const { data } = await this.curl(UPDATE, {
      dataType: 'json',
      contentType: 'json',
      method: 'POST',
      data: {
        key: this.config.lbs.key,
        table_id: this.config.lbs.table_id,
        filter: `ud_id in("${id}")`,
        data: {
          title,
          location: {
            lat: parseFloat(latitude),
            lng: parseFloat(longitude),
          },
        },
      },
    });

    if (data.status !== 0) {
      throw new Error(`更新失败，错误信息：${data.message}`);
    }

    if (data.result.count === 0) {
      await this.create(id, title, longitude, latitude);
    }
  },

  /**
   * 删除定位
   * @param {*} id id
   */
  async lbs_delete(id) {
    const { data } = await this.curl(DELETE, {
      dataType: 'json',
      contentType: 'json',
      method: 'POST',
      data: {
        key: this.config.lbs.key,
        table_id: this.config.lbs.table_id,
        filter: `ud_id in("${id}")`,
      },
    });

    if (data.status !== 0) {
      throw new Error(`删除失败，错误信息：${data.message}`);
    }
  },

  /**
   * 国际坐标 转 国标坐标
   * @param {*} lat 纬度
   * @param {*} lng 经度
   */
  async lbs_translate(lat, lng) {
    const { data } = await this.curl(TRANSLATE, {
      dataType: 'json',
      contentType: 'json',
      method: 'GET',
      data: {
        type: 1,
        locations: `${lat},${lng}`,
        key: this.config.lbs.key,
      },
    });

    if (data.status !== 0) {
      throw new Error(`经纬度转换错误，错误信息：${data.message}`);
    }

    return {
      longitude: data.locations[0].lng,
      latitude: data.locations[0].lat,
    };
  },

  /**
   * IP地址获取其当前所在地理位置
   * @param {*} ip ip
   */
  async lbs_ip(ip) {
    const { data } = await this.curl(IP, {
      dataType: 'json',
      contentType: 'json',
      method: 'GET',
      data: {
        ip,
        key: this.config.lbs.key,
      },
    });

    if (data.status !== 0) {
      throw new Error(`解析IP失败，错误信息：${data.message}`);
    }

    return data.result;
  },

  /**
   * 地址解析
   * @param {*} lat 纬度
   * @param {*} lng 经度
   * @param {*} address 地理位置
   */
  async lbs_geocoder(lat, lng, address) {
    const post = {};
    if (address) {
      post.address;
    } else if (lat && lng) {
      post.location = `${lat},${lng}`;
    }
    const { data } = await this.curl(GEOCODER, {
      dataType: 'json',
      contentType: 'json',
      method: 'GET',
      data: {
        ...post,
        key: this.config.lbs.key,
      },
    });

    if (data.status !== 0) {
      throw new Error(`解析失败，错误信息：${data.message}`);
    }

    return data.result;
  },
};
