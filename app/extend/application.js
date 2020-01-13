'use strict';
const CREATE = 'https://apis.map.qq.com/place_cloud/data/create';
const UPDATE = 'https://apis.map.qq.com/place_cloud/data/update';
const DELETE = 'https://apis.map.qq.com/place_cloud/data/delete';
const TRANSLATE = 'https://apis.map.qq.com/ws/coord/v1/translate';

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
};
