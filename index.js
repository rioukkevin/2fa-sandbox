const Koa = require("koa");
const Router = require("@koa/router");
var twoFactor = require("node-2fa");
var db = require("node-localdb");
var user = db("data/user.json");

const PORT = 3000;

const app = new Koa();
const router = new Router();

router.get("/", (ctx, next) => {
  ctx.body = "Hello 2fa";
});

router.get("/new/:account", (ctx, next) => {
  var newSecret = twoFactor.generateSecret({
    name: "Test app",
    account: ctx.params.account,
  });
  user
    .insert({
      account: ctx.params.account,
      secret: newSecret.secret,
    })
    .then(function (u) {
      console.log(u);
    });
  console.log(newSecret);
  ctx.body = `
    <img src="${newSecret.qr}" >
  `;
});

router.get("/auth/:account/:token", async (ctx, next) => {
  const userInDb = await user.findOne({ account: ctx.params.account });
  const isOk = twoFactor.verifyToken(userInDb.secret, ctx.params.token);
  ctx.body = isOk !== null ? "OK" : "NOK";
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
