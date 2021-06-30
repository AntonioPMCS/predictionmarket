
class DB {

   static getMarkets() {
      return axios.get(APIURL+"/markets")
      //return axios.get('https://api.meridian-network.co/markets');
   }
   
   static getMarket(conditionId) {
      return axios.get(APIURL+"/markets/"+conditionId)
      //return axios.get('https://api.meridian-network.co/markets/'+conditionId);
   }
   
   static addMarket(market) {
      /*return axios.post("http://45.80.153.27/markets" ,{
         "id": "0xc5fb3ec454a69552b31901d76b8b9179dd4b2ed909ab8917bcf18d8f36efae28",
         "state": "OPEN",
         "title": "For testing purposes. Created 2 Jan 2020",
         "creationDate": "Tue Dec 29 2020 21:14:07 GMT-0300 (Brasilia Standard Time)",
         "endDate": "Tue Dec 29 2020 21:14:07 GMT-0300 (Brasilia Standard Time)",
         "resolutionSource": "www.official.com",
         "description": "Duis molestie, sapien ac ornare porta, turpis lorem pharetra felis, vel finibus mi odio vel erat. Duis eros risus, iaculis sed diam accumsan, vulputate placerat lorem. ",
         "marketMakerAddress": "0x014d8Cd07d82EF0416C44B07572c668FC2c6fB1f",
         "yesPositionID": "44661074380062083045827760503621294771348337454329700307832371409140722716261",
         "noPositionID": "9509996024045250346433888744380689727982853192536525514701639325520068667215"
       })*/
      console.log(market)
      return axios.post(APIURL+'/markets', market);
   }
   
   static resolveMarket(marketConditionId) {
      return axios.put(APIURL+"/markets/"+marketConditionId
      , {"state": "CLOSED"})
   }
   
   static editMarket(market) {
      return axios.put(APIURL+"/markets/"+market.conditionId
      , market);
   }

}
