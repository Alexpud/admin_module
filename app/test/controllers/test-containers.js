var supertest = require("supertest"),
  chai = require("chai"),
  chaiHTTP = require("chai-http"),
  expect = require("chai").expect,
  should = require("chai").should,
  chaiAsPromised = require('chai-as-promised'),
  models = require("../../models");

chai.use(chaiHTTP);
chai.use(chaiAsPromised);

var server = supertest.agent("http://localhost:3000");

describe("Containers controller",function()
{
  describe("listing all containers", function ()
  {
    it("should respond", function (done)
    {
      chai.request("http://localhost:3000")
        .get("/api/containers")
        .end(function (err, res) {
          expect(res).to.have.status(200);
          done();
        })
    });
  });

  describe("listing one", function()
  {
    describe("non existing container",function()
    {
      it("should return status 404",function(done)
      {
        chai.request("http://localhost:3000")
        .get("/api/containers/test/")
        .end(function (err, res) {
          expect(res).to.have.status(404);
          done();
        })
      });

    });

    describe("existing container",function()
    {
      it("should return a container and status 200",function(done)
      {
        chai.request("http://localhost:3000")
        .get("/api/containers/test")
        .end(function(err,res)
        {
          expect(res).to.have.status(404);
          done();
        })
      });
    })
  });

  describe("creating a container",function()
  {
    describe("without an existing user",function()
    {
      it("will not be allowed", function (done)
      {
        chai.request("http://localhost:3000")
        .post("/api/containers/test")
        .set('content-type', 'application/json')
        .send
        ({
          port: 8090,
          name: "test",
          UserLogin: "test"
        })
        .end(function (err, res) {
          expect(res).to.have.status(409);
          done();
        });
      });
    });

    describe("with an user",function(done)
    {

    });
  });
});

  