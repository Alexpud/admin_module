var supertest = require("supertest");
var chai = require("chai");
var chaiHTTP = require("chai-http");
var expect = require("chai").expect;
var models = require("/app/models");

chai.use(chaiHTTP);

// This agent refers to PORT where program is runninng.

var server = supertest.agent("http://localhost:3000");

// UNIT test begin

describe("should insert user",function()
{
  var User = require("/app/models/user");

  afterEach(function(done)
  {
    User.destroy
    ({
      where:
      {
        login:"test"
      }
    }).then(function()
    {
      done();
    });
  });

  it("should create an user",function(done)
  {
    User.create
    ({
      login:"test",
      password:"",
      token:""
    }).then(function(user)
    {
      expect(user.login).toBe('test');
      done();
    });
  });
});
describe("SAMPLE unit test",function() {

  // #1 should return home page

  it("should return home page", function (done)
  {
    chai.request("http://localhost:3000")
      .get("/api/test")
      .end(function(err,res)
      {
        expect(res).to.have.status(200);
        done();
      })
  });

  it("should list all containers",function(done)
  {
    chai.request("http://localhost:3000")
      .get("/api/containers")
      .end(function(err,res)
      {
        expect(res).to.have.status(200);
        expect(res.body).to.be.array;
        done();
      })
  });

  it("it should return a container",function(dont)
  {
    chai.request("http://localhost:3000")
      .get("/api/containers/test")
      .end(function(err,res)
      {

      })
  });
});


