const request = require("supertest");
const app = require("../app");
const { expect, describe, it } = require("jest");

describe("User API", () => {
  let token;

  it("should register a new user", async () => {
    const res = await request(app).post("/users/signup").send({
      email: "test@example.com",
      password: "examplepassword",
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("user");
  });

  it("should login an existing user", async () => {
    const res = await request(app).post("/users/login").send({
      email: "test@example.com",
      password: "examplepassword",
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("token");
    token = res.body.token;
  });

  it("should get contacts with valid token", async () => {
    const res = await request(app)
      .get("/api/contacts")
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});
