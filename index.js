const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
var webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const queryString = require("query-string");
const Database = require("./database");

const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://khanh:N2XedfpAnsdojbfu@real-estate-clusters-acson.mongodb.net/test",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const baseUrl = "https://batdongsan.com.vn/cho-thue-can-ho-chung-cu";
const app = express();
const port = process.env.PORT || 3000;
app.set("port", port);
app.listen(port, () => console.log(`App started on port ${port}.`));
app.get("/", (req, res, next) => {
  const request = fetchHtmlFromUrl(
    "https://batdongsan.com.vn/cho-thue-can-ho-chung-cu"
  );
  sendResponse(res)(request);
});

const sendResponse = (res) => async (request) => {
  return await request
    .then((data) => res.json({ status: "success", data }))
    .catch(({ status: code = 500 }) =>
      res.status(code).json({
        status: "failure",
        code,
        message: code == 404 ? "Not found." : "Request failed.",
      })
    );
};
let driver = new webdriver.Builder()
  .forBrowser("chrome")
  .setChromeOptions(
    new chrome.Options().headless().windowSize({ width: 1024, height: 768 })
  )
  .build();

const fetchHtmlFromUrl = (url) => {
  return axios
    .get(url)
    .then((response) => {
      let $ = cheerio.load(response.data);
      $("div.p-main-image-crop > a.product-avatar").each(function (i, elem) {
        const link = $(this).attr("href");
        if (link.startsWith("/")) fetchDetailProperty(link);
      });

      return [1, 2, 3, 3, 3];
    })
    .catch((error) => {
      console.log({ error });
      error.status = (error.response && error.response.status) || 500;
      throw error;
    });
};

fetchDetailProperty = async (url) => {
  return driver
    .get(baseUrl + url)
    .then(async function () {
      await driver
        .findElement(webdriver.By.xpath('//*[@id="liMap"]/a'))
        .click();
      await driver.getPageSource().then(async (source) => {
        let $ = cheerio.load(source);
        const data = {};
        data.link = baseUrl + url;
        data.id = $(
          "#product-detail > div.prd-more-info > div:nth-child(1) > div"
        )
          .text()
          .replace(/(\r\n|\n|\r)/gm, "");
        if (data.id == "") {
          console.log(response.config.url);
        }
        const date =
          $("#product-detail > div.prd-more-info > div:nth-child(3)")
            .text()
            .slice(11)
            .replace(/(\r\n|\n|\r)/gm, "")
            .split("-")
            .reverse()
            .join("-") +
          `T${Math.floor(Math.random() * 23)
            .toString()
            .padStart(2, "0")}:${Math.floor(Math.random() * 59)
            .toString()
            .padStart(2, "0")}:${Math.floor(Math.random() * 59)
            .toString()
            .padStart(2, "0")}`;
        console.log("Date", date);
        data.post_date = new Date(date).toISOString();
        data.address = $("#product-other-detail > div:nth-child(2) > div.right")
          .text()
          .replace(/(\r\n|\n|\r)/gm, "");
        data.images = [];
        $("#thumbs > li > img").each(function (i) {
          data.images[i] = $(this).attr("src");
        });
        data.connect_name = $(
          "#LeftMainContent__productDetail_contactName > div.right.divContactName"
        )
          .text()
          .replace(/(\r\n|\n|\r)/gm, "");
        data.connect_phone = $(
          "#LeftMainContent__productDetail_contactMobile > div.right.contact-phone > span"
        )
          .attr("raw")
          .replace(/(\r\n|\n|\r)/gm, "");
        data.connect_mail = $("#contactEmail > div.right.contact-email")
          .text()
          .split("\n")[1];
        data.price = $(
          "#product-detail > div.kqchitiet > span:nth-child(2) > span.gia-title.mar-right-15 > strong"
        )
          .text()
          .replace(/(\r\n|\n|\r)/gm, "");

        data.title = $("#product-detail > div.pm-title > h1")
          .text()
          .replace(/(\r\n|\n|\r)/gm, "");
        data.area_cal = $(
          "#product-detail > div.kqchitiet > span:nth-child(2) > span:nth-child(2) > strong"
        )
          .text()
          .replace(/(\r\n|\n|\r)/gm, "");
        const content = $(
          "#product-detail > div.pm-content > div.pm-desc"
        ).text();
        data.content = content.slice(1, des.length - 2);

        const coordinate = queryString
          .parse($("#maputility > iframe").attr("src"))
          ["https://www.google.com/maps/embed/v1/place?q"].split(",");
        const location = (
          await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${coordinate[0]}&lon=${coordinate[1]}`
          )
        ).data.features[0];

        data.location = location.geometry;
        data.address_geocode = location.properties.display_name;
        data.address_geocode_obj = location.properties.address;
        data.realeastate_type = "APARTMENT";
        // data.address_district = change_alias(location.properties.address.town.split(' ').slice(1).join('_').toUpperCase())
        data.address_street = location.properties.address.road;
        data.price = 1234;
        console.log(JSON.stringify(data, null, 2));
        return data;
      });
    })
    .catch((error) => {
      console.log({ error });
      error.status = (error.response && error.response.status) || 500;
      throw error;
    });
};

formatText = (text) => text.replace(/(\r\n|\n|\r)/gm, "");

function change_alias(str) {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

// fetchHtmlFromUrl("https://batdongsan.com.vn/cho-thue-can-ho-chung-cu-quan-1");
