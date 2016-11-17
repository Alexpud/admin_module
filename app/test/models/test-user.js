var supertest = require("supertest");
var chai = require("chai");
var chaiHTTP = require("chai-http");
var expect = require("chai").expect;
var models = require("../../models");

chai.use(chaiHTTP);

// This agent refers to PORT where program is runninng.

var server = supertest.agent("http://localhost:3000");

// UNIT test begin

describe("User model",function()
{
  afterEach(function(done)
  {
    models.User.destroy
    ({
      where: { login:"test" }
    }).then(function()
    {
      done();
    });
  });

  it("should create an user",function(done)
  {
    models.User.create
    ({
      login:"test",
      password: "",
      token: ""
    }).then(function(user)
    {
      expect(user.login).to.eql('test');
      done();
    });
  });
});


