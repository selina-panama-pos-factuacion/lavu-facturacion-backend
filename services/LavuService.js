import axios from 'axios'
import convert from 'xml-js'
import moment from 'moment'
import qs from 'qs'

class LavuService {
  constructor() {
    this.url = 'https://api.poslavu.com/cp/reqserv/'
    this.config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  }

  async getEndOfDayOrders(startDate, endDate, envPrefix) {
    const newStartDate = moment(startDate).add(1, 'seconds').format('YYYY-MM-DD HH:mm:ss')
    const params = {
      dataname: process.env[`${envPrefix}LAVU_DATA`],
      key: process.env[`${envPrefix}LAVU_KEY`],
      token: process.env[`${envPrefix}LAVU_TOKEN`],
      table: process.env.LAVU_ORDERS_TABLE,
      column: 'closed',
      value_min: newStartDate,
      value_max: endDate,
      valid_xml: 1,
    }

    return this.postRequest(params)
  }

  getOrderContents(orderId, envPrefix) {
    const params = {
      dataname: process.env[`${envPrefix}LAVU_DATA`],
      key: process.env[`${envPrefix}LAVU_KEY`],
      token: process.env[`${envPrefix}LAVU_TOKEN`],
      table: process.env.LAVU_ORDER_CONTENTS_TABLE,
      column: 'order_id',
      value: orderId,
      valid_xml: 1,
      limit: '0,100',
    }

    return this.postRequest(params)
  }
  getOrderPayments(orderId, envPrefix) {
    const params = {
      dataname: process.env[`${envPrefix}LAVU_DATA`],
      key: process.env[`${envPrefix}LAVU_KEY`],
      token: process.env[`${envPrefix}LAVU_TOKEN`],
      table: process.env.LAVU_ORDER_PAYMENTS_TABLE,
      column: 'order_id',
      value: orderId,
      valid_xml: 1,
    }

    return this.postRequest(params)
  }

  async getOrderGeneralInfo(orderId, envPrefix) {
    const params = {
      dataname: process.env[`${envPrefix}LAVU_DATA`],
      key: process.env[`${envPrefix}LAVU_KEY`],
      token: process.env[`${envPrefix}LAVU_TOKEN`],
      table: process.env.LAVU_ORDERS_TABLE,
      column: 'order_id',
      value: orderId,
      valid_xml: 1,
    }

    return this.postRequest(params)
  }

  async postRequest(params) {
    try {
      const result = await axios.post(this.url, qs.stringify(params), this.config)
      // console.log('--POST REQUEST RESULT', JSON.stringify(result.data))
      return convert.xml2js(result.data, { ignoreComment: true }).elements[0]
    } catch (e) {
      const axiosResponse = {
        status: e.response.status,
        statusText: e.response.statusText,
        data: e.response.data,
      }
      console.error('Error: ', axiosResponse)
      return false
    }
  }
}

export default new LavuService()
