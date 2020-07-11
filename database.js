const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const propertyScheme = new Schema({
  id: String,
  link: String,
  title: String,
  content: String,
  address_street: String,
  address_district: String,
  realestate_type: String,
  price_rent: Number,
  area_cal: Number,
  post_date: String,
  amenities: [String],
  location: {
    type: String,
    coordinates: [Number],
  },
  address: String,
  address_geocode: [
    {
      road: String,
      suburb: String,
      city: String,
      county: String,
      postcode: String,
      country: String,
      country_code: String,
      "natural": "Hồ",
                    "road": "Nguyễn Du",
                    "suburb": "Phường Đông Hòa",
                    "town": "Thị xã Dĩ An",
                    "state": "Tỉnh Bình Dương",
                    "postcode": "7200000",
                    "country": "Việt Nam",
                    "country_code": "vn",
                    "suburb": "Phường Linh Trung",
                    "city": "Thành phố Hồ Chí Minh",
                    "town": "Quận Thủ Đức",
                    "postcode": "7200000",
    },
  ],
});
propertyScheme.path("_id");
const Modal = mongoose.model("property", propertyScheme);
const property = new Modal();

class Database {
  saveData() {}
}

const instant = new Database();
module.exports = instant;
