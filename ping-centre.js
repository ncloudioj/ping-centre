"use strict";

require('isomorphic-fetch');
const commonSchema = require('./schemas/commonSchema');
const Joi = require('joi');
const uuid = require('uuid');

const PING_ENDPOINT = "";

class PingCentre {
  constructor(topic, clientID, pingEndpoint, schema) {
    if (!topic) {
      throw new Error("Must specify topic.");
    }
    this._topic = topic
    this._clientID = clientID || uuid();
    this._schema = schema || commonSchema;
    this._pingEndpoint = pingEndpoint || PING_ENDPOINT;
  }

  validate(payload) {
    return new Promise((resolve, reject) => {
      Joi.validate(payload, this._schema, (err, value) => {
        if (err) {
          reject(new Error(`Invalid payload ${JSON.stringify(value)}: ${err}.`));
        } else {
          resolve(value);
        }
      });
    });
  }

  sendPing(data) {
    let payload = Object.assign({
      topic: this._topic,
      client_id: this._clientID
    }, data);

    return this.validate(payload).then(() => {
      return fetch(this._pingEndpoint, {method: "POST", body: payload}).then(response => {
        if (!response.ok) {
          throw new Error(`Ping failure with response code: ${response.status}`);
        } else {
          return response;
        }
      })
    }).catch(e => {
      console.error(`Ping failure with error code: ${e.message}`);
      throw e;
    });
  }
}
module.exports = PingCentre;