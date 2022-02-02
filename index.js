const puppeteer = require("puppeteer");
const { create } = require("ipfs-http-client");
const axios = require("axios");

const fs = require("fs");

//YOUR CONFIG
const RVN_ASSET = "FREN/YULETIDE2021";
const RVN_PASSWORD = "someone";
const RVN_USERNAME = "someone";
const RVN_URL = "http://127.0.0.1:8766";

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  const URL =
    "https://twitter.com/search?q=%23ravencoin&src=typed_query&f=live";
  await page.goto(URL, { waitUntil: "networkidle0" });

  await page.addStyleTag({
    content: "header { display: none !important}",
  });

  await page.addStyleTag({
    content: "[data-testid=sidebarColumn] { display: none !important}",
  });

  await page.setViewport({ width: 800, height: 1080 });
  await page.screenshot({ path: "example.png" });

  await browser.close();

  const client = create("https://ipfs.infura.io:5001");

  const file = fs.readFileSync("./example.png");
  const buffer = Buffer.from(file);

  const { cid } = await client.add(buffer);
  console.log(cid.toString());

  /*  

Transfers a quantity of an owned asset to a given address
Arguments:
1. "asset_name"               (string, required) name of asset
2. "qty"                      (numeric, required) number of assets you want to send to the address
3. "to_address"               (string, required) address to send the asset to
4. "message"                  (string, optional) Once RIP5 is voted in ipfs hash or txid hash to send along with the transfer
5. "expire_time"              (numeric, optional) UTC timestamp of when the message expires
6. "change_address"       (string, optional, default = "") the transactions RVN change will be sent to this address
7. "asset_change_address"     (string, optional, default = "") the transactions Asset change will be sent to this address
 
  */

  const options = {
    auth: {
      username: RVN_PASSWORD,
      password: RVN_USERNAME,
    },
  };
  const params = [
    RVN_ASSET,
    1,
    "RXissueAssetXXXXXXXXXXXXXXXXXhhZGt",
    cid.toString(),
  ];
  const data = {
    jsonrpc: "1.0",
    id: "n/a",
    method: "transfer",
    params,
  };

  const promise = axios.post(RVN_URL, data, options);
  promise.then((ax) => {
    console.log("Ravencoin transaction", ax.data.result);
  });
  promise.catch((e) => {
    console.error(
      "Ravencoin: could not send asset, check username/password etc for Ravencoin"
    );
  });
})();
