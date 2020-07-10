const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
var webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const queryString = require('query-string');

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
      // await driver
      //   .findElement(webdriver.By.xpath('//*[@id="maputility"]/iframe'))
      //   .getAttribute("src")
      //   .then(function (value) {
      //     // data.coordinate = value;
      //   });
      await driver.getPageSource().then( async (source) => {
        let $ = cheerio.load(source);
        const data = {};
        data.id = $(
          "#product-detail > div.prd-more-info > div:nth-child(1) > div"
        )
          .text()
          .replace(/(\r\n|\n|\r)/gm, "");
        if (data.id == "") {
          console.log(response.config.url);
        }
        data.post_date = $(
          "#product-detail > div.prd-more-info > div:nth-child(3)"
        )
          .text()
          .slice(11)
          .replace(/(\r\n|\n|\r)/gm, "");
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
        ).attr('raw')
          .replace(/(\r\n|\n|\r)/gm, "");
        data.connect_mail = $(
          "#contactEmail > div.right.contact-email"
        ).text().split('\n')[1];
        data.price_rent = $(
          "#product-detail > div.kqchitiet > span:nth-child(2) > span.gia-title.mar-right-15 > strong"
        )
          .text()
          .replace(/(\r\n|\n|\r)/gm, "");
        data.area_cal = $(
          "#product-detail > div.kqchitiet > span:nth-child(2) > span:nth-child(2) > strong"
        )
          .text()
          .replace(/(\r\n|\n|\r)/gm, "");
        data.description = $(
          "#product-detail > div.pm-content > div.pm-desc"
        ).text();
        const coordinate = queryString.parse($("#maputility > iframe").attr("src"))['https://www.google.com/maps/embed/v1/place?q'].split(',');
        const location = (await axios.get(`https://nominatim.openstreetmap.org/reverse?format=geojson&lat=${coordinate[0]}&lon=${coordinate[1]}`)).data.features[0]

        data.location = location.geometry
        data.address_geocode = location.display_name
        data.address_geocode_abc = location.address
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

const data = {
  _id: "5ee8868dce0aae732e79bf73",
  id: 366148,
  page_source: 3,
  link:
    "https://batdongsan.com.vn/cho-thue-nha-tro-phong-tro-duong-ly-thai-to-phuong-10-6/q-10-cc-vong-xoay-full-tien-nghi-tim-nguoishare-1tr2-thang-pr24074890",
  title:
    "Q. 10, CC vòng xoay Lý Thái Tổ, full tiện nghi, tìm người share phòng: 1tr2/tháng",
  content:
    "Chào bạn và cảm ơn bạn đã dành thời gian!\nMình có nhà chung cư 90 m2 rộng rãi thoáng mát, trong nhà mình có phòng cần người ở ghép cùng để share tiền phòngcó cả phòng Nam và phòng Nữ!\nNhà mình sau:\nNội thất trong nhà: Máy lạnh, tủ lạnh, máy giặt, bàn ăn, giường, bếp gas,..\nGửi xe: Có tầng hầm gửi xe.\nBạn có thể tham khảo thêm hình ảnh nhà mình qua:\nhttps://photos.app.goo.gl/Mnp9RVMWLstyxNJi8\nĐiện và nước đều theo giá nhà nước (nên bạn có thể yên tâm vì rẻ hơn phòng bên ngoài).\nKhu vực: Do là gần trung tâm thành phố nên có nhiều tuyến xe bus thuận tiện cho việc đi lại.\nVề phần mình: Vui vẻ, dễ gần, gọn gàng, sạch sẽ, nếu cần biết thêm thông tin hãy chủ động liên hệ, trên này nói không hết và cũng không tiện lắm!\nVài chú ý nhỏ gửi bạn:\nTrong sinh hoạt, chưa tốt chỗ nào mong nhận được góp ý cùng cải thiện ngày một tốt hơn.\nVới bạn mình mong muốn: Giấy tờ đầy đủ, gọn gàng, có ý thức vệ sinh riêng và chung, tiền bạc rõ ràng, thân thiện.\nLiên hệ mình: 089.663.36.84.\nNếu mình ko nghe máy được, bạn nhắn tin dùm nhé,, mình sẽ liên hệ ngay khi có thể!\nCảm ơn bạn đã dành thời gian! ",
  address_street: "Lý Thái Tổ",
  address_ward: "10",
  surrounding: "CC, vòng xoay, tuyến xe bus",
  surrounding_name: "vòng xoay Lý Thái Tổ",
  surrounding_character: "thuận tiện cho việc đi lại",
  interior_room: "",
  project: "",
  address_city: 1,
  address_district: 11,
  transaction_type: 2,
  realestate_type: 3,
  price_sell: 0,
  price_rent: 1200000,
  legal: 2,
  floor: 1,
  position_street: 6,
  potential: "{2}",
  area_origin: "{0,0}",
  address_num: null,
  lat: 10.76818324,
  long: 106.6715892,
  coordinate: "(106.67158915152595,10.768183241467774)",
  price_m2: 13333.33333,
  orientation: "",
  area_cal: 90,
  post_id: 24074890,
  post_date: 1579021200,
  crawled_date: 1579072955,
  create_at: "49:25.1",
  location: {
    type: "Point",
    coordinates: [106.67158915152595, 10.768183241467774],
  },
};
formatText = (text) => text.replace(/(\r\n|\n|\r)/gm, "");

fetchHtmlFromUrl("https://batdongsan.com.vn/cho-thue-can-ho-chung-cu");